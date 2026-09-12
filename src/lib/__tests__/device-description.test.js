import { describe, expect, it } from 'vitest'
import { deviceLabel, humanizeMacModel, parseDeviceDescription } from '../device-description'

describe('parseDeviceDescription', () => {
  it('parses the full desktop format', () => {
    const parsed = parseDeviceDescription('Mac=Model:MacBookPro18,3|ComputerName:Consultorio 2|Arch:arm64')
    expect(parsed).toMatchObject({
      platform: 'Mac',
      model: 'MacBookPro18,3',
      modelFamily: 'MacBook Pro',
      modelLabel: 'MacBook Pro (18,3)',
      computerName: 'Consultorio 2',
      arch: 'arm64',
      isParsed: true,
    })
  })

  it('tolerates missing keys and no platform prefix', () => {
    expect(parseDeviceDescription('Model:Mac14,9')).toMatchObject({
      platform: null,
      modelFamily: 'Mac',
      modelLabel: 'Mac (14,9)',
      computerName: null,
      isParsed: true,
    })
    expect(parseDeviceDescription('Mac=ComputerName:Recepción')).toMatchObject({
      model: null,
      computerName: 'Recepción',
      isParsed: true,
    })
  })

  it('keeps free text when nothing is parseable', () => {
    expect(parseDeviceDescription('MacBook Pro')).toMatchObject({ isParsed: false, raw: 'MacBook Pro' })
  })

  it('returns null for empty or non-string input', () => {
    expect(parseDeviceDescription('')).toBeNull()
    expect(parseDeviceDescription('   ')).toBeNull()
    expect(parseDeviceDescription(null)).toBeNull()
    expect(parseDeviceDescription(undefined)).toBeNull()
    expect(parseDeviceDescription(12)).toBeNull()
  })
})

describe('humanizeMacModel', () => {
  it('maps known families', () => {
    expect(humanizeMacModel('MacBookAir10,1').label).toBe('MacBook Air (10,1)')
    expect(humanizeMacModel('Macmini9,1').family).toBe('Mac mini')
    expect(humanizeMacModel('MacStudio13,1').family).toBe('Mac Studio')
    expect(humanizeMacModel('iMac21,1').family).toBe('iMac')
  })

  it('falls back to the raw model for unknown formats', () => {
    expect(humanizeMacModel('VirtualMac2,1')).toEqual({ family: 'VirtualMac', label: 'VirtualMac (2,1)', generation: '2,1' })
    expect(humanizeMacModel('MacBook Pro')).toEqual({ family: 'MacBook Pro', label: 'MacBook Pro', generation: null })
    expect(humanizeMacModel('')).toBeNull()
  })
})

describe('deviceLabel', () => {
  it('joins model and computer name', () => {
    expect(deviceLabel('Mac=Model:MacBookPro18,3|ComputerName:Destino|Arch:arm64')).toBe('MacBook Pro (18,3) · Destino')
    expect(deviceLabel('Mac=Model:MacBookPro18,3')).toBe('MacBook Pro (18,3)')
  })

  it('uses raw text or fallback', () => {
    expect(deviceLabel('MacBook Pro')).toBe('MacBook Pro')
    expect(deviceLabel('', 'Sin datos')).toBe('Sin datos')
    expect(deviceLabel(null)).toBeNull()
  })
})
