export type Action = "export"

export type ExportFormValues = {
  datasetId: string
  samplingInterval?: number
  samplingSeed?: number
  beginDt?: string
  endDt?: string
  limit?: number
}
