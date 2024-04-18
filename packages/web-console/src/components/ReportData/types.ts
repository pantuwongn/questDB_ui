export type Action = "report"

export type ReportResponse = {
    database_name: string
    table_name: string
    dataset_id: string
    num_datapoints: number
    from: string
    to: string
    num_days: number
    num_months: number
    num_years: number
    columns: string[]
}