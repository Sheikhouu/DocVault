#!/bin/bash

# Script de conversion vers PDF pour n8n DocVault
# Usage: convert-to-pdf.sh <input_file> <output_dir> [options]

set -e  # Exit on error

# Configuration
INPUT_FILE="$1"
OUTPUT_DIR="$2"
OPTIONS="${3:-default}"

# Vérifier les arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <input_file> <output_dir> [options]"
    echo "Options: default, optimize, high-quality"
    exit 1
fi

# Vérifier que le fichier d'entrée existe
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' does not exist"
    exit 1
fi

# Créer le répertoire de sortie s'il n'existe pas
mkdir -p "$OUTPUT_DIR"

# Obtenir le nom de fichier sans extension
BASENAME=$(basename "$INPUT_FILE" | sed 's/\.[^.]*$//')
OUTPUT_FILE="$OUTPUT_DIR/${BASENAME}.pdf"

# Obtenir l'extension du fichier
EXTENSION="${INPUT_FILE##*.}"
EXTENSION=$(echo "$EXTENSION" | tr '[:upper:]' '[:lower:]')

echo "Converting '$INPUT_FILE' to '$OUTPUT_FILE'"
echo "File type: $EXTENSION"

# Fonction de conversion selon le type de fichier
convert_with_libreoffice() {
    echo "Using LibreOffice for conversion..."
    
    # Options LibreOffice selon le mode
    case "$OPTIONS" in
        "optimize")
            LO_OPTIONS="--headless --convert-to pdf:writer_pdf_Export:{\"ExportBookmarks\":false,\"ExportNotes\":false} --outdir"
            ;;
        "high-quality")
            LO_OPTIONS="--headless --convert-to pdf:writer_pdf_Export:{\"Quality\":95,\"ExportBookmarks\":true} --outdir"
            ;;
        *)
            LO_OPTIONS="--headless --convert-to pdf --outdir"
            ;;
    esac
    
    # Exécuter LibreOffice
    libreoffice $LO_OPTIONS "$OUTPUT_DIR" "$INPUT_FILE"
    
    # Vérifier si la conversion a réussi
    if [ ! -f "$OUTPUT_FILE" ]; then
        echo "Error: LibreOffice conversion failed"
        return 1
    fi
}

convert_with_imagemagick() {
    echo "Using ImageMagick for image conversion..."
    
    case "$OPTIONS" in
        "optimize")
            convert "$INPUT_FILE" -quality 75 -compress jpeg "$OUTPUT_FILE"
            ;;
        "high-quality")
            convert "$INPUT_FILE" -quality 95 -density 300 "$OUTPUT_FILE"
            ;;
        *)
            convert "$INPUT_FILE" -quality 85 "$OUTPUT_FILE"
            ;;
    esac
}

convert_with_pandoc() {
    echo "Using Pandoc for text conversion..."
    pandoc "$INPUT_FILE" -o "$OUTPUT_FILE"
}

# Conversion selon le type de fichier
case "$EXTENSION" in
    # Documents LibreOffice/Microsoft Office
    "doc"|"docx"|"odt"|"rtf"|"ods"|"xls"|"xlsx"|"ppt"|"pptx"|"odp"|"ods")
        convert_with_libreoffice
        ;;
    
    # Images
    "jpg"|"jpeg"|"png"|"gif"|"bmp"|"tiff"|"tif"|"webp")
        convert_with_imagemagick
        ;;
    
    # Texte simple et Markdown
    "txt"|"md"|"markdown")
        convert_with_pandoc
        ;;
    
    # Déjà PDF
    "pdf")
        echo "File is already PDF, copying..."
        cp "$INPUT_FILE" "$OUTPUT_FILE"
        ;;
    
    # Type non supporté
    *)
        echo "Error: Unsupported file type: $EXTENSION"
        echo "Supported types: doc, docx, odt, rtf, xls, xlsx, ods, ppt, pptx, odp, jpg, jpeg, png, gif, bmp, tiff, txt, md, pdf"
        exit 1
        ;;
esac

# Vérifier que le fichier de sortie a été créé
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
    echo "Conversion successful!"
    echo "Output file: $OUTPUT_FILE"
    echo "File size: $FILE_SIZE bytes"
    
    # Optimisation post-conversion si demandée
    if [ "$OPTIONS" = "optimize" ]; then
        echo "Applying PDF optimization..."
        /usr/local/bin/optimize-pdf.sh "$OUTPUT_FILE"
    fi
    
    exit 0
else
    echo "Error: Conversion failed - output file not created"
    exit 1
fi