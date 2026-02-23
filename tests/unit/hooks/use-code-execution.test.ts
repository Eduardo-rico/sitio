import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCodeExecution } from '@/components/python-editor/useCodeExecution'

const {
  mockUsePyodide,
  mockLoadPyodide,
} = vi.hoisted(() => ({
  mockUsePyodide: vi.fn(),
  mockLoadPyodide: vi.fn(),
}))

vi.mock('@/components/python-editor/usePyodide', () => ({
  usePyodide: mockUsePyodide,
}))

describe('useCodeExecution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ejecuta código en el primer intento cuando Pyodide inicia como null', async () => {
    let stdoutHandler: ((text: string) => void) | undefined
    let stderrHandler: ((text: string) => void) | undefined

    const mockPyodide = {
      setStdout: vi.fn((options: { batched?: (text: string) => void } = {}) => {
        stdoutHandler = options.batched
      }),
      setStderr: vi.fn((options: { batched?: (text: string) => void } = {}) => {
        stderrHandler = options.batched
      }),
      runPythonAsync: vi.fn(async () => {
        stdoutHandler?.('hola desde pyodide')
        stderrHandler?.('')
      }),
    }

    mockLoadPyodide.mockResolvedValue(mockPyodide)
    mockUsePyodide.mockReturnValue({
      status: 'idle',
      pyodide: null,
      error: null,
      load: mockLoadPyodide,
    })

    const { result } = renderHook(() => useCodeExecution())

    let executionResult: Awaited<ReturnType<typeof result.current.executeCode>> | undefined
    await act(async () => {
      executionResult = await result.current.executeCode('print("hola")')
    })

    expect(mockLoadPyodide).toHaveBeenCalledTimes(1)
    expect(mockPyodide.runPythonAsync).toHaveBeenCalledTimes(1)
    expect(executionResult?.error).toBeUndefined()
    expect(executionResult?.stdout).toContain('hola desde pyodide')
  })
})

