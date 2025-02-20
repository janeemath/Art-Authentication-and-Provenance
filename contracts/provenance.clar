;; Provenance Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))

;; Data Maps
(define-map provenance-records
  { record-id: uint }
  {
    artwork-id: uint,
    from: principal,
    to: principal,
    transaction-type: (string-ascii 20),
    timestamp: uint
  }
)

(define-map artwork-provenance
  { artwork-id: uint }
  (list 100 uint)
)

(define-data-var record-nonce uint u0)

;; Public Functions
(define-public (record-provenance (artwork-id uint) (from principal) (to principal) (transaction-type (string-ascii 20)))
  (let
    ((new-record-id (+ (var-get record-nonce) u1)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (map-set provenance-records
      { record-id: new-record-id }
      {
        artwork-id: artwork-id,
        from: from,
        to: to,
        transaction-type: transaction-type,
        timestamp: block-height
      }
    )
    (map-set artwork-provenance
      { artwork-id: artwork-id }
      (unwrap! (as-max-len? (append (default-to (list) (map-get? artwork-provenance { artwork-id: artwork-id })) new-record-id) u100) ERR_NOT_AUTHORIZED)
    )
    (var-set record-nonce new-record-id)
    (ok new-record-id)
  )
)

;; Read-only Functions
(define-read-only (get-provenance-record (record-id uint))
  (map-get? provenance-records { record-id: record-id })
)

(define-read-only (get-artwork-provenance (artwork-id uint))
  (map-get? artwork-provenance { artwork-id: artwork-id })
)

