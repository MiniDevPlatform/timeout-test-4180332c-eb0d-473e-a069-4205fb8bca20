/**
 * MiniDev ONE Template - useGamepad Hook
 * 
 * Gamepad controller support with vibration.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

type GamepadState = {
  connected: boolean;
  index: number | null;
  mapping: GamepadMapping | null;
  buttons: GamepadButton[];
  axes: number[];
  buttonsPrevious: GamepadButton[];
  axesPrevious: number[];
};

type GamepadMapping = 'standard' | 'xr-standard' | 'touchpad';

interface GamepadButton {
  pressed: boolean;
  touched: boolean;
  value: number;
}

type ButtonKey = 'a' | 'b' | 'x' | 'y' | 'lb' | 'rb' | 'lt' | 'rt' | 'start' | 'select' | 'l3' | 'r3' | 'up' | 'down' | 'left' | 'right';

const BUTTON_MAP: Record<ButtonKey, number> = {
  a: 0, b: 1, x: 2, y: 3,
  lb: 4, rb: 5,
  lt: 6, rt: 7,
  start: 9, select: 8,
  l3: 10, r3: 11,
  up: 12, down: 13, left: 14, right: 15,
};

export function useGamepad() {
  const rafRef = useRef<number | null>(null);
  const [state, setState] = useState<GamepadState>({
    connected: false,
    index: null,
    mapping: null,
    buttons: [],
    axes: [],
    buttonsPrevious: [],
    axesPrevious: [],
  });

  // Poll gamepad state
  const pollGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (!gp) {
      setState(prev => ({
        ...prev,
        connected: false,
        index: null,
      }));
    } else {
      setState(prev => ({
        connected: true,
        index: gp.index,
        mapping: gp.mapping as GamepadMapping,
        buttons: gp.buttons,
        axes: Array.from(gp.axes),
        buttonsPrevious: prev.buttons,
        axesPrevious: prev.axes,
      }));
    }

    rafRef.current = requestAnimationFrame(pollGamepad);
  }, []);

  // Start polling
  useEffect(() => {
    window.addEventListener('gamepadconnected', () => setState(prev => ({ ...prev, connected: true })));
    window.addEventListener('gamepaddisconnected', () => setState(prev => ({ ...prev, connected: false })));

    rafRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pollGamepad]);

  // Check if button is pressed
  const isButtonPressed = useCallback((button: ButtonKey | number): boolean => {
    const index = typeof button === 'number' ? button : BUTTON_MAP[button];
    const current = state.buttons[index];
    const previous = state.buttonsPrevious[index];
    
    return current?.pressed && !previous?.pressed;
  }, [state.buttons, state.buttonsPrevious]);

  // Check if button is held
  const isButtonHeld = useCallback((button: ButtonKey | number): boolean => {
    const index = typeof button === 'number' ? button : BUTTON_MAP[button];
    return state.buttons[index]?.pressed || false;
  }, [state.buttons]);

  // Get button value (for analog buttons like triggers)
  const getButtonValue = useCallback((button: ButtonKey | number): number => {
    const index = typeof button === 'number' ? button : BUTTON_MAP[button];
    return state.buttons[index]?.value || 0;
  }, [state.buttons]);

  // Get axis value
  const getAxis = useCallback((index: number): number => {
    return state.axes[index] || 0;
  }, [state.axes]);

  // Get left stick
  const getLeftStick = useCallback((): { x: number; y: number } => {
    return { x: state.axes[0] || 0, y: state.axes[1] || 0 };
  }, [state.axes]);

  // Get right stick
  const getRightStick = useCallback((): { x: number; y: number } => {
    return { x: state.axes[2] || 0, y: state.axes[3] || 0 };
  }, [state.axes]);

  // Vibration
  const vibrate = useCallback(async (
    duration: number = 200,
    strongMagnitude: number = 0.5,
    weakMagnitude: number = 0.5
  ): Promise<boolean> => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (!gp?.vibrationActuator) return false;

    try {
      await gp.vibrationActuator.playEffect('dual-rumble', {
        duration,
        strongMagnitude,
        weakMagnitude,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    connected: state.connected,
    index: state.index,
    isButtonPressed,
    isButtonHeld,
    getButtonValue,
    getAxis,
    getLeftStick,
    getRightStick,
    vibrate,
    buttons: state.buttons,
    axes: state.axes,
  };
}

export default useGamepad;
