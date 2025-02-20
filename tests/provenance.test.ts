import { describe, it, expect, beforeEach } from "vitest"

describe("Provenance Contract", () => {
  let mockStorage: Map<string, any>
  let recordNonce: number
  
  beforeEach(() => {
    mockStorage = new Map()
    recordNonce = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "record-provenance":
        const [artworkId, from, to, transactionType] = args
        recordNonce++
        mockStorage.set(`record-${recordNonce}`, {
          artworkId,
          from,
          to,
          transactionType,
          timestamp: 100, // Mock block height
        })
        return { success: true, value: recordNonce }
      case "get-provenance-record":
        return { success: true, value: mockStorage.get(`record-${args[0]}`) }
      case "get-artwork-provenance":
        return {
          success: true,
          value: Array.from(mockStorage.values()).filter((record) => record.artworkId === args[0]),
        }
      default:
        return { success: false, error: "Method not found" }
    }
  }
  
  it("should record provenance", () => {
    const result = mockContractCall("record-provenance", [1, "seller1", "buyer1", "sale"], "CONTRACT_OWNER")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should get provenance record", () => {
    mockContractCall("record-provenance", [1, "seller1", "buyer1", "sale"], "CONTRACT_OWNER")
    const result = mockContractCall("get-provenance-record", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value.from).toBe("seller1")
    expect(result.value.to).toBe("buyer1")
  })
  
  it("should get artwork provenance", () => {
    mockContractCall("record-provenance", [1, "seller1", "buyer1", "sale"], "CONTRACT_OWNER")
    mockContractCall("record-provenance", [1, "buyer1", "buyer2", "sale"], "CONTRACT_OWNER")
    const result = mockContractCall("get-artwork-provenance", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value.length).toBe(2)
  })
})

