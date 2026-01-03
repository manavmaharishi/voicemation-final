import os
import re
import subprocess
import speech_recognition as sr
import shutil
import sys
import time
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from voiceover_utils import generate_voiceover
from dotenv import load_dotenv
from mutagen.mp3 import MP3

load_dotenv()

def sanitize_manim_code(manim_code: str) -> str:
    """
    Cleans up common GPT mistakes for Manim v0.18 compatibility.
    Ensures UTF-8 safe output.
    """
    # ✅ Force UTF-8 safe text by removing invalid characters
    code = manim_code.encode("utf-8", "ignore").decode("utf-8")

    # ✅ Common replacements for symbols that break Python
    replacements = {
        "×": "*",
        "÷": "/",
        "−": "-",
        "‒": "-",
        "–": "-",
        "—": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "©": "(c)",
        "™": "(tm)",
        "°": "deg"
    }
    for bad, good in replacements.items():
        code = code.replace(bad, good)

    # ✅ Remove font_size arguments inside get_text()
    code = re.sub(
        r'get_text\(([^)]*?),\s*font_size\s*=\s*\d+\)',
        r'get_text(\1).scale(0.7)',
        code
    )

    # ✅ Fix `get_text("txt", color=...)` → `.get_text("txt").set_color(...)`
    code = re.sub(
        r'get_text\("([^"]+)"\s*,\s*color\s*=\s*([A-Z_]+)\)',
        r'get_text("\1").set_color(\2)',
        code
    )

    # ✅ Remove dangerous indexing like equation[0], equation[2], etc.
    # Replace with safer approaches
    code = re.sub(
        r'Indicate\([^,\[\]]+\[\d+\][^)]*\)',
        'Indicate(equation)',
        code
    )
    
    # ✅ Remove complex indexing operations that often fail
    code = re.sub(
        r'\.play\(Indicate\([^,]+\[\d+\][^)]*\)\)',
        '.play(Indicate(equation))',
        code
    )

    return code


def force_convert_to_multiscene(single_scene_code: str, topic: str) -> str:
    """
    Convert a single scene into multiple scenes for in-depth mode
    """
    print("🔧 Force converting single scene to multi-scene format...")
    
    # Extract the original construct method content
    import re
    construct_match = re.search(r"def construct\(self\):(.*?)(?=\n\s*def|\n\s*class|\Z)", single_scene_code, re.DOTALL)
    original_content = construct_match.group(1).strip() if construct_match else ""
    
    # Create 4 truly distinct scene classes
    multi_scene_code = f'''from manim import *
import numpy as np

class HeadingScene(Scene):
    def construct(self):
        # Scene 1: Title/Heading Only (90+ seconds)
        main_title = Text("{topic.title()}", font_size=56, color=BLUE).scale(2)
        self.play(Write(main_title), run_time=5)
        self.wait(20)  # Long wait for title
        
        # Add decorative elements
        underline = Line(LEFT * 6, RIGHT * 6, color=YELLOW).move_to(DOWN * 0.8)
        self.play(Create(underline), run_time=3)
        self.wait(15)  # Extended wait
        
        subtitle = Text("Complete Educational Guide", font_size=28, color=WHITE)
        subtitle.move_to(DOWN * 2)
        self.play(Write(subtitle), run_time=3)
        self.wait(20)  # Long wait for subtitle
        
        # Add more visual elements to extend time
        circle1 = Circle(radius=0.3, color=RED).move_to(LEFT * 3 + UP * 1.5)
        circle2 = Circle(radius=0.3, color=GREEN).move_to(RIGHT * 3 + UP * 1.5)
        self.play(Create(circle1), Create(circle2))
        self.wait(12)
        
        # Final title emphasis
        self.play(main_title.animate.scale(1.3).set_color(GOLD), run_time=3)
        self.wait(18)  # Final long wait
        
        self.play(FadeOut(main_title, underline, subtitle, circle1, circle2))
        self.wait(5)


class ExplanationScene(Scene):
    def construct(self):
        # Scene 2: Detailed Explanation (90+ seconds)
        explanation_title = Text("Detailed Explanation", font_size=44, color=GREEN).scale(1.3)
        self.play(Write(explanation_title), run_time=3)
        self.wait(15)  # Extended wait
        self.play(FadeOut(explanation_title))
        self.wait(5)
        
        # Step-by-step explanation with extended timing
        explanation_parts = [
            "This concept involves understanding the fundamental principles",
            "It works by applying specific methods and techniques", 
            "The key is to follow a systematic approach",
            "Each step builds upon the previous understanding",
            "Mastery comes through practice and application",
            "The theory connects to real-world scenarios"
        ]
        
        explanation_objects = []
        for i, part in enumerate(explanation_parts):
            part_text = Text(part, font_size=20, color=WHITE)
            part_text.move_to(UP * (2.5 - i * 0.8))
            explanation_objects.append(part_text)
            self.play(Write(part_text), run_time=3)
            self.wait(12)  # Much longer wait for each part
        
        self.wait(10)  # Additional wait with all text visible
        
        # Add visual elements
        definition_box = Rectangle(width=8, height=4, color=BLUE)
        definition_box.move_to(ORIGIN)
        self.play(Create(definition_box))
        self.wait(8)
        
        box_text = Text("Key Understanding", font_size=28, color=YELLOW)
        self.play(Write(box_text))
        self.wait(15)  # Long wait
        
        # Clear everything with extended timing
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait(8)


class ExampleScene(Scene):
    def construct(self):
        # Scene 3: Practical Examples (90+ seconds)
        example_title = Text("Practical Examples", font_size=44, color=PURPLE).scale(1.3)
        self.play(Write(example_title), run_time=4)
        self.wait(15)  # Extended wait
        self.play(FadeOut(example_title))
        self.wait(5)
        
        # Example 1 with step-by-step working
        ex1_title = Text("Example 1: Basic Problem", font_size=32, color=ORANGE)
        ex1_title.move_to(UP * 3)
        self.play(Write(ex1_title), run_time=3)
        self.wait(10)  # Extended wait
        
        # Show problem
        problem = Text("Given: Initial conditions and requirements", font_size=20, color=WHITE)
        problem.move_to(UP * 2.2)
        self.play(Write(problem), run_time=2)
        self.wait(12)  # Long wait for problem reading
        
        # Show solution steps with extended timing
        solution_title = Text("Solution:", font_size=24, color=YELLOW)
        solution_title.move_to(UP * 1.5)
        self.play(Write(solution_title))
        self.wait(8)
        
        steps = [
            "Step 1: Analyze the given information carefully",
            "Step 2: Apply the appropriate method or formula",
            "Step 3: Perform detailed calculations",
            "Step 4: Verify results and draw conclusions"
        ]
        
        step_positions = [UP * 0.8, UP * 0.2, DOWN * 0.4, DOWN * 1.0]
        step_objects = []
        for i, (step, pos) in enumerate(zip(steps, step_positions)):
            step_text = Text(step, font_size=18, color=WHITE)
            step_text.move_to(pos)
            step_objects.append(step_text)
            self.play(Write(step_text), run_time=2)
            self.wait(10)  # Much longer wait for each step
        
        # Show final answer
        answer = Text("Answer: [Final Result Achieved]", font_size=22, color=GREEN)
        answer.move_to(DOWN * 2.5)
        self.play(Write(answer), run_time=3)
        self.wait(15)  # Long wait for answer
        
        # Clear for next example
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait(8)  # Extended transition


class ApplicationScene(Scene):
    def construct(self):
        # Scene 4: Real-World Applications (90+ seconds)
        app_title = Text("Real-World Applications", font_size=44, color=TEAL).scale(1.3)
        self.play(Write(app_title), run_time=4)
        self.wait(15)  # Extended wait
        self.play(FadeOut(app_title))
        self.wait(5)
        
        # Industry Applications with extended timing
        industry_title = Text("Industry Applications:", font_size=28, color=YELLOW)
        industry_title.move_to(UP * 2.5)
        self.play(Write(industry_title), run_time=3)
        self.wait(8)
        
        industries = [
            "• Engineering and Construction Projects",
            "• Medical and Healthcare Systems",
            "• Finance and Economic Analysis", 
            "• Technology and Computing Solutions",
            "• Research and Development",
            "• Education and Training"
        ]
        
        industry_objects = []
        for i, industry in enumerate(industries):
            industry_obj = Text(industry, font_size=18, color=WHITE)
            industry_obj.move_to(UP * (1.8 - i * 0.5))
            industry_objects.append(industry_obj)
            self.play(Write(industry_obj), run_time=2)
            self.wait(8)  # Much longer wait for each industry
        
        self.wait(12)  # Extended display time
        self.play(FadeOut(industry_title, *industry_objects))
        self.wait(5)
        
        # Daily Life Applications with more detail
        daily_title = Text("Daily Life Examples:", font_size=28, color=ORANGE)
        daily_title.move_to(UP * 2)
        self.play(Write(daily_title), run_time=3)
        self.wait(8)
        
        daily_examples = [
            "Personal budgeting and financial planning",
            "Problem-solving in everyday situations",
            "Decision-making and critical thinking",
            "Time management and organization"
        ]
        
        daily_objects = []
        for i, example in enumerate(daily_examples):
            example_obj = Text(example, font_size=18, color=WHITE)
            example_obj.move_to(UP * (1.2 - i * 0.6))
            daily_objects.append(example_obj)
            self.play(Write(example_obj), run_time=2)
            self.wait(10)  # Extended wait for each example
        
        self.wait(15)  # Long display time
        
        # Extended Conclusion
        conclusion_title = Text("Summary & Conclusion:", font_size=26, color=GOLD)
        conclusion_title.move_to(DOWN * 1.5)
        self.play(Write(conclusion_title), run_time=3)
        self.wait(8)
        
        conclusion_text1 = Text("These applications demonstrate versatility", font_size=18, color=GREEN)
        conclusion_text1.move_to(DOWN * 2.2)
        self.play(Write(conclusion_text1))
        self.wait(12)
        
        conclusion_text2 = Text("Understanding opens many opportunities", font_size=18, color=GREEN)
        conclusion_text2.move_to(DOWN * 2.8)
        self.play(Write(conclusion_text2))
        self.wait(15)  # Final long wait
        
        self.play(*[FadeOut(mob) for mob in self.mobjects])
        self.wait(8)
'''
    
    return multi_scene_code


def extend_animation_for_depth(short_code: str, topic: str) -> str:
    """
    Programmatically extend short animations into 2+ minute comprehensive versions
    """
    print("🔧 Extending animation for in-depth mode...")
    
    # Extract class name
    import re
    class_match = re.search(r"class\s+(\w+)\s*\(Scene\):", short_code)
    class_name = class_match.group(1) if class_match else "ExtendedAnimation"
    
    # Create extended version with multiple sections
    extended_code = f'''from manim import *
import numpy as np

class {class_name}(Scene):
    def construct(self):
        # ========== SECTION 1: INTRODUCTION (20 seconds) ==========
        title = Text("{topic.title()}", font_size=48, color=BLUE).scale(1.5)
        subtitle = Text("In-Depth Educational Exploration", font_size=24, color=WHITE).scale(0.8)
        subtitle.next_to(title, DOWN, buff=0.5)
        
        self.play(Write(title))
        self.wait(3)
        self.play(Write(subtitle))
        self.wait(5)
        
        # Transition to overview
        overview = Text("Let's explore this topic comprehensively", font_size=20, color=YELLOW)
        overview.next_to(subtitle, DOWN, buff=0.8)
        self.play(Write(overview))
        self.wait(4)
        self.play(FadeOut(title), FadeOut(subtitle), FadeOut(overview))
        self.wait(2)
        
        # ========== SECTION 2: DEFINITION & THEORY (25 seconds) ==========
        def_title = Text("Definition & Core Theory", font_size=36, color=GREEN).scale(1.2)
        self.play(Write(def_title))
        self.wait(3)
        
        # Create definition box
        def_box = Rectangle(width=10, height=4, color=GREEN, fill_opacity=0.1)
        def_text = Text("Core concept definition goes here", font_size=18)
        def_text.move_to(def_box.get_center())
        
        self.play(Create(def_box))
        self.wait(2)
        self.play(Write(def_text))
        self.wait(8)
        
        # Add key points
        bullet1 = Text("• Key Point 1", font_size=16, color=WHITE)
        bullet1.next_to(def_box, DOWN, buff=0.3)
        self.play(Write(bullet1))
        self.wait(2)
        
        bullet2 = Text("• Key Point 2", font_size=16, color=WHITE) 
        bullet2.next_to(def_box, DOWN, buff=0.8)
        self.play(Write(bullet2))
        self.wait(2)
        
        bullet3 = Text("• Key Point 3", font_size=16, color=WHITE)
        bullet3.next_to(def_box, DOWN, buff=1.3)
        self.play(Write(bullet3))
        self.wait(2)
        
        self.wait(5)
        self.play(FadeOut(def_title), FadeOut(def_box), FadeOut(def_text), FadeOut(bullet1), FadeOut(bullet2), FadeOut(bullet3))
        
        # ========== SECTION 3: MATHEMATICAL FOUNDATION (30 seconds) ==========
        math_title = Text("Mathematical Foundation", font_size=36, color=RED).scale(1.2)
        self.play(Write(math_title))
        self.wait(3)
        
        # Create mathematical equations
        eq1 = MathTex(r"f(x) = ax^2 + bx + c", font_size=36)
        eq2 = MathTex(r"\\\\frac{{d}}{{dx}}f(x) = 2ax + b", font_size=36)
        
        self.play(Write(eq1))
        self.wait(3)
        eq2.next_to(eq1, DOWN, buff=0.8)
        self.play(Write(eq2))
        self.wait(8)
        
        self.play(FadeOut(math_title), FadeOut(eq1), FadeOut(eq2))
        
        # ========== SECTION 4: FIRST EXAMPLE (25 seconds) ==========
        ex1_title = Text("Example 1: Step-by-Step Solution", font_size=32, color=PURPLE)
        self.play(Write(ex1_title))
        self.wait(3)
        
        # Example problem
        problem = Text("Problem: Solve the given scenario", font_size=20, color=WHITE)
        problem.next_to(ex1_title, DOWN, buff=1)
        self.play(Write(problem))
        self.wait(4)
        
        # Step by step solution
        steps = ["Step 1: Setup", "Step 2: Calculate", "Step 3: Verify"]
        for i, step in enumerate(steps):
            step_text = Text(step, font_size=18, color=YELLOW)
            step_text.next_to(problem, DOWN, buff=1 + i*0.6)
            self.play(Write(step_text))
            self.wait(2)
        
        self.wait(6)
        self.play(FadeOut(ex1_title), FadeOut(problem))
        
        # ========== SECTION 5: SECOND EXAMPLE (25 seconds) ==========
        ex2_title = Text("Example 2: Advanced Application", font_size=32, color=ORANGE)
        self.play(Write(ex2_title))
        self.wait(3)
        
        # More complex example
        complex_eq = MathTex(r"f(x,y) = x^2 + y^2", font_size=32)
        self.play(Write(complex_eq))
        self.wait(5)
        
        # Show calculation steps
        result = MathTex(r"f(3,4) = 25", font_size=24, color=GREEN)
        result.next_to(complex_eq, DOWN, buff=1)
        self.play(Write(result))
        self.wait(8)
        
        self.play(FadeOut(ex2_title), FadeOut(complex_eq), FadeOut(result))
        
        # ========== SECTION 6: APPLICATIONS (20 seconds) ==========
        app_title = Text("Real-World Applications", font_size=36, color=TEAL)
        self.play(Write(app_title))
        self.wait(3)
        
        applications = ["Engineering", "Physics", "Economics", "Computer Science"]
        app1 = Text("• Engineering", font_size=20, color=WHITE)
        app1.next_to(app_title, DOWN, buff=1)
        self.play(Write(app1))
        self.wait(2)
        
        app2 = Text("• Physics", font_size=20, color=WHITE)
        app2.next_to(app_title, DOWN, buff=1.6)
        self.play(Write(app2))
        self.wait(2)
        
        app3 = Text("• Economics", font_size=20, color=WHITE)
        app3.next_to(app_title, DOWN, buff=2.2)
        self.play(Write(app3))
        self.wait(2)
        
        app4 = Text("• Computer Science", font_size=20, color=WHITE)
        app4.next_to(app_title, DOWN, buff=2.8)
        self.play(Write(app4))
        self.wait(2)
        
        self.wait(6)
        self.play(FadeOut(app1, app2, app3, app4, app_title))
        
        # ========== SECTION 7: SUMMARY (15 seconds) ==========
        summary_title = Text("Summary & Conclusion", font_size=36, color=GOLD)
        self.play(Write(summary_title))
        self.wait(3)
        
        final_msg = Text("Thank you for learning!", font_size=32, color=BLUE)
        final_msg.next_to(summary_title, DOWN, buff=1)
        self.play(Write(final_msg))
        self.wait(8)
        
        # Total time: ~160+ seconds (2+ minutes)
'''
    
    return extended_code


# Function to process speech and trigger animations
def process_speech(speech_text, in_depth_mode=False):
    if "exit" in speech_text.lower():
        print("Exiting program...")
        return None  # Stop listening, no video generated

    print(f"🧠 Sending speech to GPT for animation generation... (In Depth Mode: {in_depth_mode})")
    gpt_response = get_gpt_response(speech_text, in_depth_mode)
    
    # Debug: Log the GPT response to see what we're getting
    print(f"\n📝 GPT Response Length: {len(gpt_response)} characters")
    print(f"📝 First 200 chars: {gpt_response[:200]}...")
    if in_depth_mode:
        print(f"🎬 IN-DEPTH MODE: Response should be much longer with multiple scenes")

    # 🔹 Extract explanation + Manim code separately
    explanation, manim_code = extract_explanation_and_code(gpt_response)

    if manim_code:
        # Sanitize Manim code for v0.18
        manim_code = sanitize_manim_code(manim_code)
        
        # Debug: Check code length and content
        print(f"📊 Generated Manim code length: {len(manim_code)} characters")
        wait_count = manim_code.count("self.wait(")
        print(f"⏱️ Number of wait() statements found: {wait_count}")
        
        # Check if this is multi-scene content (for in-depth mode)
        scene_classes = extract_all_scene_classes(manim_code)
        print(f"🔍 DEBUG: Found {len(scene_classes)} scene classes: {scene_classes}")
        print(f"🔍 DEBUG: In-depth mode: {in_depth_mode}")
        
        # Debug: Show first 500 characters of generated code
        print(f"🔍 DEBUG: Generated code preview:\n{manim_code[:500]}...")
        print(f"🔍 DEBUG: Code contains 'class'? {manim_code.count('class ')}")
        
        # 🚀 Force multi-scene generation in in-depth mode
        # 🚨 ALWAYS FORCE MULTI-SCENE IN IN-DEPTH MODE
        if in_depth_mode:
            print(f"� IN-DEPTH MODE: GPT generated only single scene - FORCING MULTI-SCENE CONVERSION!")
            print(f"📊 GPT generated {len(scene_classes)} scene(s): {scene_classes}")
            print(f"📊 Original code length: {len(manim_code)} characters")
            # Convert single scene to multi-scene format
            manim_code = force_convert_to_multiscene(manim_code, speech_text)
            scene_classes = extract_all_scene_classes(manim_code)
            print(f"🎬 FORCED multi-scene conversion complete! Now have {len(scene_classes)} scenes: {scene_classes}")
            print(f"📊 New multi-scene code length: {len(manim_code)} characters")
            print(f"🚀 IN-DEPTH MODE WILL NOW RENDER {len(scene_classes)} SEPARATE SCENES AND CONCATENATE!")

            
        if in_depth_mode and wait_count < 5:
            print(f"⚠️ WARNING: In-depth mode should have many more wait() statements for 2+ minute videos")

        class_name = extract_class_name(manim_code)
        temp_file_path = save_manim_code_to_temp_file(manim_code)

        # ✅ Pass the natural language explanation as narration
        final_video_path = run_manim(temp_file_path, class_name, explanation)

        return final_video_path  # ✅ Return video path back to Flask
    else:
        print("❌ No valid Manim code generated.")
        return None



def extract_explanation_and_code(gpt_response):
    """
    Splits GPT response into (explanation, code).
    """
    match = re.search(r"```(?:python)?\n([\s\S]*?)```", gpt_response)
    if match:
        code = match.group(1).strip()
        explanation = gpt_response[:match.start()].strip()
        return explanation, code
    return gpt_response, None


# Get GPT response using Azure AI Inference
def get_gpt_response(speech_text, in_depth_mode=False):
    print(f"🔄 Starting GPT request for: {speech_text[:50]}... (in_depth_mode={in_depth_mode})")
    
    endpoint = "https://models.github.ai/inference"
    model = "gpt-4o"  # Fixed: was "gpt-4.1" which is invalid
    token = os.environ["GITHUB_TOKEN"]
    
    print(f"🌐 Endpoint: {endpoint}")
    print(f"🤖 Model: {model}")
    print(f"🔑 Token exists: {bool(token)}")

    try:
        print("🔧 Creating ChatCompletionsClient...")
        client = ChatCompletionsClient(
            endpoint=endpoint,
            credential=AzureKeyCredential(token),
        )
        print("✅ Client created successfully")
    except Exception as e:
        print(f"❌ Error creating client: {e}")
        raise

    # Create the base system message
    base_prompt = (
        "You are an assistant that generates BOTH:\n"
        "1. A short natural language explanation of the concept (for voiceover).\n"
        "2. Valid Manim Community v0.19.0 Python code (inside triple backticks).\n\n"
        "⚠️ Critical Manim rules:\n"
        "- NEVER use 'height' or 'width' parameters in Axes() - use x_length and y_length instead\n"
        "- Always use .scale() method for resizing objects\n"
        "- Use only valid Manim Community v0.19.0 syntax\n"
        "- Wrap ONLY the code in triple backticks\n"
        "- Do NOT wrap the explanation in code blocks\n"
        "- Include proper imports: from manim import *\n"
        "- NEVER use indexing like equation[0], equation[2] - MathTex parts may not exist\n"
        "- Use simple animations: Write, Create, FadeIn, FadeOut, Transform\n"
        "- Test all object references before using them\n"
        "- Keep animations simple and error-free\n"
        "- CORRECT GRAPH SYNTAX: axes.plot(lambda x: x**2, color=BLUE) NOT axes.get_graph()\n"
        "- CORRECT LINE SYNTAX: axes.get_vertical_line(axes.i2gp(x_val, graph)) NOT get_line_from_axis_to_axis()\n"
        "- NEVER use parameters that don't exist in Manim Community v0.19.0\n"
        "- For plotting functions use: axes.plot(function, x_range=[a,b], color=COLOR)\n"
        "- For lines use: Line(start_point, end_point, color=COLOR)\n"
        "- NEVER use get_graph() method - use axes.plot() instead\n"
        "- NEVER use get_line_from_axis_to_axis() - use Line() or axes.get_vertical_line()\n"
        "- AVOID complex indexing and part references that may not exist\n"
        "- Use basic, simple Manim objects: Text, MathTex, Line, Circle, Rectangle\n"
        "- Test with minimal, error-free animations first\n"
        "- EXAMPLE WORKING TEMPLATE:\n"
        "```python\n"
        "from manim import *\n"
        "class MyScene(Scene):\n"
        "    def construct(self):\n"
        "        title = Text('Topic').scale(1.5)\n"
        "        self.play(Write(title))\n"
        "        self.wait(2)\n"
        "        formula = MathTex('E = mc^2')\n"
        "        self.play(Transform(title, formula))\n"
        "        self.wait(3)\n"
        "```\n\n"
        "⚠️ Critical explanation rules:\n"
        "- Write ONLY the educational content that should be spoken as voiceover\n"
        "- NEVER include meta-commentary like 'Here is a Manim animation' or 'This code demonstrates'\n"
        "- NEVER mention Manim, code, or programming in the explanation\n"
        "- Focus purely on explaining the concept itself\n"
        "- Write as if you are a teacher explaining directly to a student\n"
    )
    
    # Add in-depth mode instructions if enabled
    if in_depth_mode:
        # Override the base prompt for in-depth mode
        base_prompt = (
            "📚 IN-DEPTH EDUCATIONAL MODE: You are a comprehensive educational assistant creating detailed Manim animations.\n"
            "⚠️⚠️⚠️ ABSOLUTELY MANDATORY: YOU MUST CREATE EXACTLY 4 SEPARATE SCENE CLASSES - NOT JUST ONE! ⚠️⚠️⚠️\n\n"
            "You MUST generate BOTH:\n"
            "1. A comprehensive explanation (200+ words) covering theory, examples, applications, and context.\n"
            "2. EXACTLY 4 DIFFERENT SCENE CLASSES (each 60+ seconds long) creating a total 4+ minute animation.\n\n"
            "🚨 MANDATORY SCENE CLASSES TO CREATE (COPY THESE EXACT NAMES): 🚨\n"
            "- class IntroductionScene(Scene):\n"
            "- class TheoryScene(Scene):\n"
            "- class ExampleScene(Scene):\n"
            "- class ApplicationScene(Scene):\n\n"
            "🚨 EACH SCENE MUST BE 60+ SECONDS WITH MANY self.wait() STATEMENTS! 🚨\n"
            "⚠️ Critical formatting rules:\n"
            "- Do NOT wrap the explanation in code blocks\n"
            "- Wrap ONLY the Python code in triple backticks\n"
            "- No markdown outside of explanation + code block\n\n"
            "⚠️ Critical explanation rules:\n"
            "- Write ONLY the educational content that should be spoken as voiceover\n"
            "- NEVER include meta-commentary like 'Here is a Manim animation' or 'This code demonstrates'\n"
            "- NEVER mention Manim, code, programming, or animations in the explanation\n"
            "- Focus purely on explaining the concept itself in detail\n"
            "- Write as if you are a professor giving a comprehensive lecture\n"
            "- Include detailed theory, step-by-step examples, and real-world applications\n"
        )
        
        in_depth_addition = (
            "\n🎬 MULTI-SCENE IN-DEPTH MODE - CREATE MULTIPLE DISTINCT SCENES:\n"
            "- YOU MUST CREATE 4-6 SEPARATE SCENE CLASSES, not just one scene\n"
            "- EACH SCENE should be 40-60 seconds long with distinct visual content\n"
            "- SCENES should flow logically: Introduction → Theory → Example1 → Example2 → Applications → Summary\n"
            "- TOTAL combined runtime: 3-4 minutes across all scenes (longer than voiceover)\n\n"
            "🎯 MANDATORY MULTI-SCENE STRUCTURE:\n"
            "```python\n"
            "from manim import *\n"
            "import numpy as np\n\n"
            "class IntroScene(Scene):\n"
            "    def construct(self):\n"
            "        # Scene 1: Introduction & Overview (40-50 seconds)\n"
            "        title = Text('Topic Name').scale(2)\n"
            "        self.play(Write(title))\n"
            "        self.wait(8)\n"
            "        # Add overview content with animations...\n"
            "        self.wait(32)\n\n"
            "class DefinitionScene(Scene):\n"
            "    def construct(self):\n"
            "        # Scene 2: Detailed Definition & Theory (50-60 seconds)\n"
            "        def_title = Text('Definition & Theory').scale(1.8)\n"
            "        self.play(Write(def_title))\n"
            "        self.wait(5)\n"
            "        # Add theoretical content, formulas with step-by-step reveals...\n"
            "        self.wait(45)\n\n"
            "class Example1Scene(Scene):\n"
            "    def construct(self):\n"
            "        # Scene 3: First Detailed Example (50-60 seconds)\n"
            "        ex1_title = Text('Example 1: Basic Case').scale(1.8)\n"
            "        self.play(Write(ex1_title))\n"
            "        self.wait(5)\n"
            "        # Add step-by-step example with calculations and visual aids...\n"
            "        self.wait(45)\n\n"
            "class Example2Scene(Scene):\n"
            "    def construct(self):\n"
            "        # Scene 4: Second Advanced Example (50-60 seconds)\n"
            "        ex2_title = Text('Example 2: Advanced Case').scale(1.8)\n"
            "        self.play(Write(ex2_title))\n"
            "        self.wait(5)\n"
            "        # Add complex example with graphs, animations, detailed workings...\n"
            "        self.wait(45)\n\n"
            "class ApplicationScene(Scene):\n"
            "    def construct(self):\n"
            "        # Scene 5: Real-world Applications (40-50 seconds)\n"
            "        app_title = Text('Real-World Applications').scale(1.8)\n"
            "        self.play(Write(app_title))\n"
            "        self.wait(5)\n"
            "        # Add practical applications with visual demonstrations...\n"
            "        self.wait(35)\n\n"
            "class SummaryScene(Scene):\n"
            "    def construct(self):\n"
            "        # Scene 6: Summary & Key Takeaways (30-40 seconds)\n"
            "        summary_title = Text('Summary & Key Points').scale(1.8)\n"
            "        self.play(Write(summary_title))\n"
            "        self.wait(5)\n"
            "        # Add key points recap with visual elements...\n"
            "        self.wait(25)\n"
            "```\n"
            "⚠️ CRITICAL MULTI-SCENE REQUIREMENTS:\n"
            "- EACH SCENE CLASS must be complete and self-contained with 40-60 seconds runtime\n"
            "- EACH SCENE must have MORE wait time than needed to extend video beyond voiceover length\n"
            "- USE DIFFERENT VISUAL APPROACHES: text animations, mathematical workings, graphs, diagrams, step-by-step reveals\n"
            "- INCLUDE TWO DETAILED EXAMPLE SCENES with different complexity levels\n"
            "- ENSURE smooth logical progression between all scenes\n"
            "- TOTAL code must be 200+ lines across all scenes\n"
            "- MAKE VIDEO LONGER THAN VOICEOVER by adding extensive visual content and wait times\n"
        )
        system_message_content = base_prompt + in_depth_addition
    else:
        system_message_content = base_prompt

    print(f"🔤 System message length: {len(system_message_content)} chars")
    print(f"📝 User message: {speech_text}...")
    
    try:
        print("🚀 Making API call to GitHub Models...")
        
        response = client.complete(
            messages=[
                SystemMessage(system_message_content),
                UserMessage(f"{speech_text}" + (" - CREATE MULTIPLE SCENE CLASSES (4-6 scenes) FOR A COMPREHENSIVE 3-4 MINUTE IN-DEPTH EDUCATIONAL ANIMATION. MANDATORY SCENES: IntroScene, DefinitionScene, Example1Scene, Example2Scene, ApplicationScene, SummaryScene. Each scene should be 40-60 seconds with extensive visual content and wait times. Include detailed step-by-step examples, mathematical workings, graphs, and animations. MAKE THE VIDEO LONGER THAN THE VOICEOVER by adding rich visual content. MINIMUM 200+ LINES OF MANIM CODE ACROSS ALL SCENES." if in_depth_mode else "")),
            ],
            temperature=0.7,
            top_p=1.0,
            max_tokens=4000 if in_depth_mode else 2000,  # Allow longer responses for in-depth mode
            model=model
        )
        
        print("✅ API call successful!")
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        raise

    gpt_response = response.choices[0].message.content
    print(f"\n📩 GPT Response Length: {len(gpt_response)} characters")
    print(f"📩 GPT Response:\n{gpt_response}\n")
    print(f"🔍 Response truncated?: {len(gpt_response) >= 3800}")  # Check if hitting token limit
    return gpt_response


# Extract only Python code block from GPT response
def extract_manim_code(gpt_response):
    match = re.search(r"```(?:python)?\n([\s\S]*?)```", gpt_response)
    if match:
        code = match.group(1).strip()
        print("✅ Extracted Python code successfully.")
        return code
    else:
        print("❌ No valid Python code block found in GPT response.")
        return None


# Extract Scene class name dynamically
def extract_class_name(manim_code):
    match = re.search(r"class\s+(\w+)\s*\(Scene\):", manim_code)
    if match:
        return match.group(1)
    return "Scene"


# Save code to a temp .py file
def save_manim_code_to_temp_file(manim_code):
    temp_file_path = os.path.join(
        os.getenv("TEMP", "/tmp"),
        "generated_manim_code.py"
    )
    with open(temp_file_path, "w", encoding="utf-8") as file:
        file.write(manim_code)
    print(f"📁 Saved Manim code to: {temp_file_path}")
    return temp_file_path


# helper: get audio duration
def get_audio_duration(audio_path):
    audio = MP3(audio_path)
    return audio.info.length  # seconds


# Run the Manim animation
from voiceover_utils import generate_voiceover, add_voiceover_to_video, generate_srt_file

def run_manim(temp_file_path, class_name, explanation):
    """
    Run manim to generate video and then merge it with AI narration.
    For multi-scene content, detect all scene classes and concatenate them.
    Returns the path to the final video with voiceover.
    """
    # Check if this is a multi-scene file
    with open(temp_file_path, 'r') as f:
        content = f.read()
    
    scene_classes = extract_all_scene_classes(content)
    
    if len(scene_classes) > 1:
        print(f"🎬 Multi-scene detected! Found {len(scene_classes)} scenes: {scene_classes}")
        return run_multi_scene_manim(temp_file_path, scene_classes, explanation)
    else:
        # Single scene - use original logic
        return run_single_scene_manim(temp_file_path, class_name, explanation)


def extract_all_scene_classes(manim_code):
    """Extract all Scene class names from Manim code"""
    import re
    pattern = r"class\s+(\w+)\s*\(Scene\):"
    matches = re.findall(pattern, manim_code)
    return matches


def run_single_scene_manim(temp_file_path, class_name, explanation):
    """Run single scene Manim animation"""
    # Use manim from PATH (should work with venv) or fall back to module invocation
    manim_exe = shutil.which("manim")
    if manim_exe:
        command = [manim_exe, "-ql", temp_file_path, class_name]
    else:
        # Use the current Python executable to run manim as a module
        command = [sys.executable, "-m", "manim", "-ql", temp_file_path, class_name]
    video_output_path = os.path.join(
        "media", "videos", "generated_manim_code", "480p15", f"{class_name}.mp4"
    )

    try:
        print("🎬 Running single scene Manim command:", " ".join(command))
        # Increase timeout for longer in-depth animations
        timeout_duration = 300  # 5 minutes for complex animations
        subprocess.run(command, capture_output=True, text=True, check=True, timeout=timeout_duration)
        print("\n✅ Manim animation complete.\n")

        # Generate voiceover
        narration_path = generate_voiceover(explanation)

        # Merge video with voiceover and subtitles (using ffmpeg)
        final_output = add_voiceover_to_video(
            video_output_path, 
            narration_path,
            add_subtitles=True,
            subtitle_text=explanation
        )

        if final_output:
            print(f"🎉 Final video ready at: {final_output}")
            return final_output   # ✅ return path here
        else:
            print("⚠️ Could not merge voiceover with video.")
            return None

    except subprocess.CalledProcessError as e:
        print("❌ Manim execution error:")
        print("Output:", e.stdout)
        print("Errors:", e.stderr)
        return None
    except subprocess.TimeoutExpired:
        print("⏱ Manim command timed out.")
        return None


def run_multi_scene_manim(temp_file_path, scene_classes, explanation):
    """Run multiple scenes and concatenate them into one video"""
    manim_exe = shutil.which("manim")
    if not manim_exe:
        manim_exe = [sys.executable, "-m", "manim"]
    else:
        manim_exe = [manim_exe]
    
    scene_videos = []
    
    try:
        # Generate each scene
        for i, scene_class in enumerate(scene_classes):
            print(f"🎬 Rendering scene {i+1}/{len(scene_classes)}: {scene_class}")
            command = manim_exe + ["-ql", temp_file_path, scene_class]
            
            subprocess.run(command, capture_output=True, text=True, check=True, timeout=300)
            
            video_path = os.path.join(
                "media", "videos", "generated_manim_code", "480p15", f"{scene_class}.mp4"
            )
            
            if os.path.exists(video_path):
                scene_videos.append(video_path)
                print(f"✅ Scene {scene_class} rendered successfully")
            else:
                print(f"❌ Scene {scene_class} video not found")
        
        if not scene_videos:
            print("❌ No scenes were successfully rendered")
            return None
        
        # Concatenate all scene videos
        print(f"🔗 Concatenating {len(scene_videos)} scenes...")
        concatenated_video = concatenate_videos(scene_videos)
        
        if not concatenated_video:
            print("❌ Failed to concatenate videos")
            return None
        
        # Generate voiceover
        narration_path = generate_voiceover(explanation)
        
        # Merge concatenated video with voiceover and subtitles (no looping for multi-scene)
        final_output = add_voiceover_to_multiscene_video(
            concatenated_video, 
            narration_path,
            add_subtitles=True,
            subtitle_text=explanation
        )
        
        if final_output:
            print(f"🎉 Multi-scene video ready at: {final_output}")
            return final_output
        else:
            print("⚠️ Could not merge voiceover with concatenated video.")
            return None
            
    except subprocess.CalledProcessError as e:
        print("❌ Multi-scene Manim execution error:")
        print("Output:", e.stdout)
        print("Errors:", e.stderr)
        return None
    except subprocess.TimeoutExpired:
        print("⏱ Multi-scene Manim command timed out.")
        return None


def add_voiceover_to_multiscene_video(video_path, audio_path, add_subtitles=False, subtitle_text=None):
    """
    Add voiceover to multi-scene video without looping.
    For multi-scene videos, we don't want to loop since we have enough content.
    """
    if not os.path.exists(video_path):
        print(f"❌ Video not found at: {video_path}")
        return None

    output_path = video_path.replace(".mp4", "_with_voiceover.mp4")
    
    # Get audio duration for subtitle timing
    srt_path = None
    if add_subtitles and subtitle_text:
        try:
            from mutagen.mp3 import MP3
            audio = MP3(audio_path)
            audio_duration = audio.info.length
            srt_path = generate_srt_file(subtitle_text, audio_duration)
        except Exception as e:
            print(f"⚠️ Could not generate subtitles: {e}")
            srt_path = None

    # Base ffmpeg command
    command = [
        "ffmpeg",
        "-y",  # Overwrite without asking
        "-i", video_path,
        "-i", audio_path,
    ]
    
    # Add subtitle filter if available
    if srt_path and os.path.exists(srt_path):
        srt_path_escaped = srt_path.replace('\\', '/').replace(':', '\\:')
        command.extend([
            "-vf", f"subtitles={srt_path_escaped}:force_style='FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BackColour=&H80000000&,Bold=1,Alignment=2,MarginV=20'",
        ])
        command.extend([
            "-c:v", "libx264",
            "-c:a", "aac",
            "-map", "0:v:0",
            "-map", "1:a:0",
            output_path
        ])
    else:
        command.extend([
            "-c:v", "copy",         # Copy video without re-encoding (faster)
            "-c:a", "aac",          # Encode audio in AAC
            "-map", "0:v:0",        # Use video from first input
            "-map", "1:a:0",        # Use audio from second input
            output_path
        ])

    try:
        subtitle_status = " with subtitles" if srt_path else ""
        print(f"🎞️ Adding voiceover{subtitle_status} to multi-scene video...")
        subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"✅ Multi-scene video with voiceover saved at: {output_path}")
        
        # Clean up subtitle file
        if srt_path and os.path.exists(srt_path):
            try:
                os.remove(srt_path)
            except:
                pass
                
        return output_path
    except subprocess.CalledProcessError as e:
        print(f"❌ ffmpeg failed: {e}")
        return None


def concatenate_videos(video_paths):
    """Concatenate multiple video files using ffmpeg"""
    if not video_paths:
        return None
    
    if len(video_paths) == 1:
        return video_paths[0]
    
    # Create a temporary file list for ffmpeg concat
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        for video_path in video_paths:
            f.write(f"file '{os.path.abspath(video_path)}'\n")
        concat_list_path = f.name
    
    # Output path for concatenated video
    timestamp = int(time.time())
    output_path = f"media/videos/multi_scene_{timestamp}.mp4"
    
    try:
        command = [
            "ffmpeg", "-f", "concat", "-safe", "0", 
            "-i", concat_list_path, 
            "-c", "copy", 
            output_path, "-y"
        ]
        
        print(f"🔗 Running ffmpeg concatenation: {' '.join(command)}")
        subprocess.run(command, capture_output=True, text=True, check=True)
        
        # Clean up temp file
        os.unlink(concat_list_path)
        
        if os.path.exists(output_path):
            print(f"✅ Videos concatenated successfully: {output_path}")
            return output_path
        else:
            print("❌ Concatenated video not found")
            return None
            
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg concatenation error: {e}")
        print("Output:", e.stdout)
        print("Errors:", e.stderr)
        # Clean up temp file
        if os.path.exists(concat_list_path):
            os.unlink(concat_list_path)
        return None



# Main speech recognition loop
if __name__ == "__main__":
    recognizer = sr.Recognizer()

    while True:
        with sr.Microphone() as source:
            print("\n🎤 Listening for animation commands (say 'exit' to quit)...")

            # Adjust to ambient noise before listening
            recognizer.adjust_for_ambient_noise(source, duration=1)
            print("🕒 You can start speaking now...")

            try:
                print("speak...")
                audio = recognizer.record(source, duration=10)

                speech_text = recognizer.recognize_google(audio)
                print(f"🗣 Recognized: {speech_text}")
                if not process_speech(speech_text):
                    break
            except sr.WaitTimeoutError:
                print("⏳ No speech detected, try again.")
            except sr.UnknownValueError:
                print("🤷 Could not understand the audio.")
            except sr.RequestError:
                print("🚫 Speech recognition service is unavailable.")
            except KeyboardInterrupt:
                print("\n🛑 Program terminated.")
                break
