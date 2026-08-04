'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Fade-in animation that always completes — avoids content stuck at opacity: 0
 * when IntersectionObserver / whileInView fails on first paint.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 20,
  as = 'div',
  viewport = false,
  ...rest
}) {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(Boolean(reduceMotion))
  const MotionComp = motion[as] || motion.div

  useEffect(() => {
    if (reduceMotion) {
      setVisible(true)
      return
    }
    const fallback = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(fallback)
  }, [reduceMotion])

  const motionProps = viewport
    ? {
        initial: reduceMotion ? false : { opacity: 0, y },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.05 },
        onViewportEnter: () => setVisible(true),
        animate: visible ? { opacity: 1, y: 0 } : undefined,
      }
    : {
        initial: reduceMotion ? false : { opacity: 0, y },
        animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y },
      }

  return (
    <MotionComp
      className={className}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      {...motionProps}
      {...rest}
    >
      {children}
    </MotionComp>
  )
}
