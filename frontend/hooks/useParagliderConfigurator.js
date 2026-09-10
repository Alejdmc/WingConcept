'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  NO_PARAGLIDER_ID,
  findTrikeParaglider,
  getParagliderColorGallery,
  getParagliderDefaultGallery,
  paragliderDisplayName,
  resolveParagliderColorLabel,
} from '@/lib/trikeParagliderOptions'

export function useParagliderConfigurator() {
  const [selectedParagliderId, setSelectedParagliderId] = useState(NO_PARAGLIDER_ID)
  const [selectedParagliderColor, setSelectedParagliderColor] = useState('')
  const [selectedParagliderSize, setSelectedParagliderSize] = useState('')

  const paraglider = findTrikeParaglider(selectedParagliderId)
  const paragliderPrice = paraglider?.price || 0

  const validateParaglider = useCallback(() => {
    if (paraglider && (!selectedParagliderColor || !selectedParagliderSize)) {
      return 'Please select wing color and size before continuing.'
    }
    return null
  }, [paraglider, selectedParagliderColor, selectedParagliderSize])

  const paragliderCartFields = useMemo(() => ({
    paraglider: selectedParagliderId !== NO_PARAGLIDER_ID ? selectedParagliderId : undefined,
    paragliderColor: selectedParagliderColor || undefined,
    paragliderSize: selectedParagliderSize || undefined,
  }), [selectedParagliderId, selectedParagliderColor, selectedParagliderSize])

  const appendParagliderQuoteLines = useCallback((lines) => {
    if (!paraglider) return lines
    lines.push(`Paraglider: ${paragliderDisplayName(paraglider)}`)
    if (selectedParagliderColor) {
      lines.push(`Wing color: ${resolveParagliderColorLabel(paraglider, selectedParagliderColor)}`)
    }
    if (selectedParagliderSize) lines.push(`Wing size: ${selectedParagliderSize}`)
    return lines
  }, [paraglider, selectedParagliderColor, selectedParagliderSize])

  const getParagliderPreviewGallery = useCallback(() => {
    if (!paraglider) return []
    return selectedParagliderColor
      ? getParagliderColorGallery(paraglider, selectedParagliderColor)
      : getParagliderDefaultGallery(paraglider)
  }, [paraglider, selectedParagliderColor])

  return {
    selectedParagliderId,
    setSelectedParagliderId,
    selectedParagliderColor,
    setSelectedParagliderColor,
    selectedParagliderSize,
    setSelectedParagliderSize,
    paraglider,
    paragliderPrice,
    validateParaglider,
    paragliderCartFields,
    appendParagliderQuoteLines,
    getParagliderPreviewGallery,
  }
}
