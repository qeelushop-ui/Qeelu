# Product Images Directory

This directory stores uploaded product images organized by category and product name.

## Structure
```
products/
├── {category}/
│   └── {product-name}/
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...
```

## Examples
- `products/electronics/smartphone-pro/1701234567890.jpg`
- `products/fashion/summer-dress/1701234567891.jpg`
- `products/home/modern-lamp/1701234567892.jpg`

## Notes
- Product images are automatically organized by their category
- Product names are sanitized (lowercase, special characters replaced with hyphens)
- Each image has a unique timestamp prefix to avoid conflicts
- Uploaded files are ignored by git (see .gitignore)

