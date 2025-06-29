# Icon Generator Script
# This creates simple but functional SVG icons and converts them to PNG

$iconSvg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#grad)" stroke="#4a5568" stroke-width="2"/>
  <path d="M40 50 L88 50 L88 58 L40 58 Z" fill="white" opacity="0.9"/>
  <path d="M40 66 L78 66 L78 74 L40 74 Z" fill="white" opacity="0.9"/>
  <path d="M40 82 L68 82 L68 90 L40 90 Z" fill="white" opacity="0.9"/>
  <circle cx="75" cy="85" r="8" fill="#ffd700" stroke="white" stroke-width="1"/>
  <path d="M75 81 L77 85 L75 89 L73 85 Z" fill="white"/>
</svg>
"@

# Save SVG template
$iconSvg | Out-File -FilePath "icon-template.svg" -Encoding UTF8
Write-Host "Created icon-template.svg"
