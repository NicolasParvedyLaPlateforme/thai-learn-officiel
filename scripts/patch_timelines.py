import os
import re

files = [
    'c:/xampp/htdocs/thai-learn-officiel/app/components/learn/LearnDesktopTimeline.tsx',
    'c:/xampp/htdocs/thai-learn-officiel/app/components/learn/LearnMobileTimeline.tsx',
    'c:/xampp/htdocs/thai-learn-officiel/app/components/alphabet/AlphabetDesktopTimeline.tsx',
    'c:/xampp/htdocs/thai-learn-officiel/app/components/alphabet/AlphabetMobileTimeline.tsx',
    'c:/xampp/htdocs/thai-learn-officiel/app/components/speak/SpeakDesktopTimeline.tsx',
    'c:/xampp/htdocs/thai-learn-officiel/app/components/speak/SpeakMobileTimeline.tsx',
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add import
    import_statement = "import { NextUnitCard } from '../NextUnitCard';\n"
    if import_statement not in content:
        # Find last import
        imports_end = content.rfind("import ")
        if imports_end != -1:
            line_end = content.find("\n", imports_end)
            content = content[:line_end+1] + import_statement + content[line_end+1:]

    is_mobile = "Mobile" in file_path

    # 2. Fix the container div
    # Mobile typically has: <div className="flex flex-col relative w-full items-center mt-8 pb-20"> or similar
    # Desktop typically has: <div className="flex flex-col relative w-full mt-10 pb-32">
    
    # Let's use regex to find the relative wrapper
    wrapper_regex = r'(<div className="[^"]*flex flex-col relative w-full[^"]*")([^>]*>)\s*<div className="absolute left-[^"]*top-[^"]*bottom-[^"]*w-[^"]*rounded-full z-0[^"]*"></div>'
    match = re.search(wrapper_regex, content)
    
    if match:
        wrapper_start = match.start(0)
        
        # Determine if it's desktop or mobile
        mt_val = "mt-10" if not is_mobile else "mt-8"
        
        # We need to wrap the lessons inside a new relative container so the line ends properly
        # Find the line div
        line_div_regex = r'<div className="absolute left-[^"]*top-[^"]*bottom-[^"]*w-[^"]*rounded-full z-0[^"]*"></div>'
        line_match = re.search(line_div_regex, content[wrapper_start:])
        
        if line_match:
            actual_line_div = line_match.group(0).replace("bottom-[8rem]", "bottom-0").replace("bottom-0", "bottom-0")
            
            # The original structure:
            # <div flex flex-col relative ... mt-10 pb-32>
            #   <line />
            #   {lessons.map...}
            #   {nextUnit && ...}
            # </div>
            
            # Find the nextUnit block
            next_unit_regex = r'\{\s*nextUnit\s*&&\s*\([\s\S]*?(?=<motion\.div|<div)[\s\S]*?handleUnitSelect[\s\S]*?\}\s*\)'
            next_unit_match = re.search(next_unit_regex, content)
            
            if next_unit_match:
                # Replace next unit block
                next_card = f"""{{nextUnit && (
          <div className="w-full px-4 md:px-0">
             <NextUnitCard 
               nextUnit={{nextUnit}} 
               nextUnitIndex={{activeUnitIndex + 1}} 
               language={{language}} 
               handleUnitSelect={{handleUnitSelect}} 
               isMobile={{{str(is_mobile).lower()}}} 
             />
          </div>
        )}}"""
                content = content[:next_unit_match.start()] + next_card + content[next_unit_match.end():]
                
                # Now inject the new relative wrapper around lessons
                # It starts right before the line
                new_wrapper_start = wrapper_start + len(match.group(1)) + len(match.group(2))
                
                # We need to find the end of the lessons.map block.
                # It usually ends right before {nextUnit && (
                
                # Replace the original wrapper with a non-relative one
                content = content[:match.start(1)] + f'<div className="flex flex-col w-full {mt_val}"' + content[match.start(2):]
                
                # Find the line again since indices changed
                line_match = re.search(line_div_regex, content)
                if line_match:
                    content = content[:line_match.start()] + f'<div className="flex flex-col relative w-full pb-8 md:pb-16">\n          {actual_line_div}' + content[line_match.end():]
                    
                    # Close the relative wrapper just before nextUnit
                    nu_match = re.search(r'\{\s*nextUnit\s*&&\s*\(', content)
                    if nu_match:
                        content = content[:nu_match.start()] + "</div>\n\n        " + content[nu_match.start():]
    else:
        print(f"Wrapper not found in {file_path}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Timelines patched.")
