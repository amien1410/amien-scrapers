#!/usr/bin/env python3
"""
Universal CAPTCHA Handler for any website
Integrates with the main automation workflow
"""

import asyncio
from core import CaptchaSolver

async def handle_captcha_on_page(page, max_attempts: int = 3) -> bool:
    """
    Universal CAPTCHA handler that can be called on any page
    Returns True if CAPTCHA was solved successfully or no CAPTCHA present
    """
    solver = CaptchaSolver()
    
    for attempt in range(max_attempts):
        print(f"🤖 CAPTCHA check attempt {attempt + 1}/{max_attempts}")
        
        try:
            # Wait for page to load completely
            await page.wait_for_load_state('networkidle', timeout=10000)
            await asyncio.sleep(2)
            
            # Detect CAPTCHA
            captcha_info = await solver.detect_captcha_universal(page)
            
            if captcha_info['type'] == 'none':
                print("✅ No CAPTCHA detected - proceeding")
                return True
            
            print(f"🎯 Found {captcha_info['type'].upper()} - attempting to solve...")
            
            # Solve CAPTCHA
            token = await solver.solve_captcha_universal(page)
            
            if not token:
                print(f"❌ CAPTCHA solving failed (attempt {attempt + 1})")
                continue
            
            # Inject solution
            injection_success = await solver.inject_captcha_solution_universal(
                page, token, captcha_info['type']
            )
            
            if injection_success:
                print("✅ CAPTCHA solved and injected successfully!")
                
                # Wait for page to process the solution
                await asyncio.sleep(3)
                
                # Check if CAPTCHA disappeared (success indicator)
                new_captcha = await solver.detect_captcha_universal(page)
                if new_captcha['type'] == 'none':
                    print("🎉 CAPTCHA successfully resolved!")
                    return True
                else:
                    print("⚠️ CAPTCHA still present, trying again...")
                    continue
            else:
                print(f"❌ Token injection failed (attempt {attempt + 1})")
                continue
                
        except Exception as e:
            print(f"❌ CAPTCHA handling error (attempt {attempt + 1}): {e}")
            continue
    
    print(f"❌ All CAPTCHA solving attempts failed")
    return False

async def auto_solve_captcha_if_present(page) -> bool:
    """
    Convenience function - automatically solve CAPTCHA if present
    Use this in your main automation workflow
    """
    return await handle_captcha_on_page(page)

async def wait_and_solve_captcha(page, timeout: int = 30) -> bool:
    """
    Wait for CAPTCHA to appear and solve it
    Useful for pages that load CAPTCHA dynamically
    """
    print(f"⏳ Waiting up to {timeout}s for CAPTCHA to appear...")
    
    start_time = asyncio.get_event_loop().time()
    solver = CaptchaSolver()
    
    while (asyncio.get_event_loop().time() - start_time) < timeout:
        try:
            await asyncio.sleep(2)
            captcha_info = await solver.detect_captcha_universal(page)
            
            if captcha_info['type'] != 'none':
                print(f"✅ CAPTCHA appeared: {captcha_info['type']}")
                return await handle_captcha_on_page(page)
                
        except Exception as e:
            print(f"⚠️ Error while waiting for CAPTCHA: {e}")
            continue
    
    print("⏰ No CAPTCHA appeared within timeout")
    return True  # No CAPTCHA is also success

async def handle_captcha_immediately(page) -> dict:
    """
    Immediate CAPTCHA detection and solving for navigation
    Returns detailed results for better error handling
    """
    from core import CaptchaSolver
    
    result = {
        "found": False,
        "solved": False,
        "type": None,
        "method": None,
        "error": None
    }
    
    try:
        solver = CaptchaSolver()
        
        # Step 1: Quick detection
        captcha_info = await solver.detect_captcha_universal(page)
        
        if captcha_info['type'] == 'none':
            return result  # No CAPTCHA found
        
        result['found'] = True
        result['type'] = captcha_info['type']
        result['method'] = captcha_info['method']
        
        print(f"🎯 CAPTCHA DETECTED: {captcha_info['type']} (confidence: {captcha_info['confidence']}%)")
        
        # Step 2: Attempt to solve
        token = await solver.solve_captcha_universal(page)
        
        if token:
            # Step 3: Inject solution
            injection_success = await solver.inject_captcha_solution_universal(
                page, token, captcha_info['type']
            )
            
            if injection_success:
                result['solved'] = True
                print("🎉 CAPTCHA solved and injected successfully!")
                
                # Wait for page to process
                await asyncio.sleep(2)
                
                # Verify CAPTCHA is gone
                new_check = await solver.detect_captcha_universal(page)
                if new_check['type'] == 'none':
                    print("✅ CAPTCHA completely resolved!")
                else:
                    print("⚠️ CAPTCHA still present after solving")
            else:
                result['error'] = "Token injection failed"
        else:
            result['error'] = "No solution token received"
            
    except Exception as e:
        result['error'] = str(e)
        print(f"❌ CAPTCHA handling error: {e}")
    
    return result

async def smart_captcha_handler(page, wait_time: int = 5) -> bool:
    """
    Smart CAPTCHA handler that:
    1. Checks immediately for existing CAPTCHA
    2. Waits a bit for dynamic CAPTCHA loading
    3. Handles any CAPTCHA found
    """
    print("🧠 Smart CAPTCHA detection starting...")
    
    # Step 1: Check immediately
    immediate_result = await auto_solve_captcha_if_present(page)
    if not immediate_result:
        return False
    
    # Step 2: Wait for dynamic loading and check again
    print(f"⏳ Waiting {wait_time}s for dynamic content...")
    await asyncio.sleep(wait_time)
    
    # Step 3: Final check
    final_result = await auto_solve_captcha_if_present(page)
    return final_result

# Export main functions
__all__ = [
    'handle_captcha_on_page',
    'auto_solve_captcha_if_present', 
    'wait_and_solve_captcha',
    'smart_captcha_handler',
    'handle_captcha_immediately'
]
