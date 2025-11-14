#!/usr/bin/env python3
"""
Create a 64x64 icon for EHR Browser
Represents tree structure visualization with purple theme
"""

from PIL import Image, ImageDraw

# Create a 64x64 image with transparent background
size = 64
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Color scheme from the app
dark_purple = (23, 5, 64)      # #170540
medium_purple = (118, 90, 182) # #765ab6
purple = (167, 144, 226)       # #a790e2
light_purple = (224, 218, 239) # #e0daef

# Draw a circular background
draw.ellipse([4, 4, 60, 60], fill=medium_purple, outline=dark_purple, width=2)

# Draw a tree structure matching the app's visualization
# Central prominent node (root of current view) - in the middle
central_node = (32, 32)

# Parent nodes above (fanning upward) - smaller, grayish
parent_nodes = [
    (20, 18),  # Left parent
    (32, 14),  # Center parent
    (44, 18),  # Right parent
]

# Child nodes below (fanning downward) - multiple children
child_nodes = [
    (16, 44),  # Left child
    (28, 48),  # Left-center child
    (36, 48),  # Right-center child
    (48, 44),  # Right child
]

# Define tree edges
edges = []
# Connect parents to central node
for parent in parent_nodes:
    edges.append((parent, central_node))
# Connect central node to children
for child in child_nodes:
    edges.append((central_node, child))

# Draw edges first (so they appear behind nodes) - use darker color for visibility
for (x1, y1), (x2, y2) in edges:
    draw.line([(x1, y1), (x2, y2)], fill=(100, 100, 120), width=1)

# Draw nodes
# Central node (largest, most prominent - purple like in the app)
draw.ellipse([central_node[0]-7, central_node[1]-7, central_node[0]+7, central_node[1]+7], 
             fill=purple, outline=dark_purple, width=2)

# Parent nodes (smaller, grayish like in the app)
for node in parent_nodes:
    draw.ellipse([node[0]-3, node[1]-3, node[0]+3, node[1]+3], 
                 fill=(180, 180, 200), outline=(120, 120, 140), width=1)

# Child nodes (medium size, various colors like in the app)
child_colors = [
    (255, 200, 150),  # Orange-ish
    (150, 200, 255),  # Blue-ish
    (200, 255, 200),  # Green-ish
    (255, 200, 255),  # Pink-ish
]
for i, node in enumerate(child_nodes):
    color = child_colors[i % len(child_colors)]
    draw.ellipse([node[0]-4, node[1]-4, node[0]+4, node[1]+4], 
                 fill=color, outline=medium_purple, width=1)

# Save the icon
output_path = 'icon_64x64.png'
img.save(output_path, 'PNG')
print(f"Icon created successfully: {output_path}")

