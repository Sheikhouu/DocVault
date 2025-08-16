#!/bin/bash

# Script d'optimisation PDF pour n8n DocVault
# Usage: optimize-pdf.sh <pdf_file> [quality]

set -e

PDF_FILE="$1"
QUALITY="${2:-default}"

if [ $# -lt 1 ]; then
    echo "Usage: $0 <pdf_file> [quality]"
    echo "Quality options: low, default, high"
    exit 1
fi

if [ ! -f "$PDF_FILE" ]; then
    echo "Error: PDF file '$PDF_FILE' does not exist"
    exit 1
fi

# Backup du fichier original
BACKUP_FILE="${PDF_FILE}.backup"
cp "$PDF_FILE" "$BACKUP_FILE"

# Obtenir la taille originale
ORIGINAL_SIZE=$(stat -f%z "$PDF_FILE" 2>/dev/null || stat -c%s "$PDF_FILE" 2>/dev/null)

echo "Optimizing PDF: $PDF_FILE"
echo "Original size: $ORIGINAL_SIZE bytes"

# Fichier temporaire
TEMP_FILE="${PDF_FILE}.tmp"

# Options d'optimisation selon la qualité
case "$QUALITY" in
    "low")
        gs -sDEVICE=pdfwrite \
           -dCompatibilityLevel=1.4 \
           -dPDFSETTINGS=/screen \
           -dNOPAUSE \
           -dQUIET \
           -dBATCH \
           -sOutputFile="$TEMP_FILE" \
           "$PDF_FILE"
        ;;
    "high")
        gs -sDEVICE=pdfwrite \
           -dCompatibilityLevel=1.4 \
           -dPDFSETTINGS=/prepress \
           -dNOPAUSE \
           -dQUIET \
           -dBATCH \
           -sOutputFile="$TEMP_FILE" \
           "$PDF_FILE"
        ;;
    *)
        gs -sDEVICE=pdfwrite \
           -dCompatibilityLevel=1.4 \
           -dPDFSETTINGS=/ebook \
           -dNOPAUSE \
           -dQUIET \
           -dBATCH \
           -sOutputFile="$TEMP_FILE" \
           "$PDF_FILE"
        ;;
esac

# Vérifier que l'optimisation a réussi
if [ -f "$TEMP_FILE" ]; then
    NEW_SIZE=$(stat -f%z "$TEMP_FILE" 2>/dev/null || stat -c%s "$TEMP_FILE" 2>/dev/null)
    
    # Calculer le ratio de compression
    COMPRESSION_RATIO=$(echo "scale=2; ($ORIGINAL_SIZE - $NEW_SIZE) * 100 / $ORIGINAL_SIZE" | bc -l 2>/dev/null || echo "N/A")
    
    echo "Optimized size: $NEW_SIZE bytes"
    echo "Compression: $COMPRESSION_RATIO%"
    
    # Remplacer le fichier original par la version optimisée
    mv "$TEMP_FILE" "$PDF_FILE"
    
    # Supprimer le backup si l'optimisation est réussie
    rm -f "$BACKUP_FILE"
    
    echo "PDF optimization completed successfully"
else
    echo "Error: PDF optimization failed"
    # Restaurer le fichier original
    mv "$BACKUP_FILE" "$PDF_FILE"
    exit 1
fi