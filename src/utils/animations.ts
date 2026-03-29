import { withSpring, withTiming, Easing, withSequence, withRepeat } from 'react-native-reanimated';

export const springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 1,
};

export const bouncierSpringConfig = {
    damping: 10,
    stiffness: 200,
    mass: 1,
};

export const fadeIn = (duration = 300) => {
    'worklet';
    return withTiming(1, { duration, easing: Easing.out(Easing.ease) });
};

export const slideUp = (offset = 50) => {
    'worklet';
    return withSpring(0, springConfig);
};

export const slideIn = (offset = 50) => {
    'worklet';
    return withSpring(0, springConfig);
};

export const scaleIn = (target = 1) => {
    'worklet';
    return withSpring(target, springConfig);
};

export const pulse = (scaleTarget = 1.05, duration = 500) => {
    'worklet';
    return withRepeat(
        withSequence(
            withTiming(scaleTarget, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        true // reverse
    );
};
