import React, { useEffect, useState } from "react"
import { Button } from "@questdb/react-components"
import { Box } from "../Box"
import { Text } from "../Text"
import styled from "styled-components"
import { Table as TableIcon, Edit } from "@styled-icons/remix-line"
import { InfoCircle } from "@styled-icons/boxicons-regular"
import { Form } from "../Form"
import { Columns } from "./columns"
import { Drawer } from "../Drawer"
import { PopperHover } from "../PopperHover"
import { Tooltip } from "../Tooltip"
import { Action, SchemaColumn, SchemaFormValues } from "./types"
import Joi from "joi"
import { isValidTableName } from "./isValidTableName"
import * as QuestDB from "../../utils/questdb"
import { useDispatch } from "react-redux"
import { actions } from "../../store"
import { Panel } from "../../components/Panel"
import { Actions } from "./actions"

const StyledContentWrapper = styled(Drawer.ContentWrapper)`
  --columns: auto 120px; /* magic numbers to fit input, type dropdown and remove button nicely */
`

const Items = styled(Box).attrs({ gap: "0", flexDirection: "column" })`
  height: 100%;
`

const Inputs = styled(Box).attrs({ gap: "0", flexDirection: "column" })`
  width: 100%;
  height: 100%;
  overflow: auto;
`

const Controls = styled.div<{ action: Action }>`
  display: grid;
  grid-template-columns: ${({ action }) =>
    action === "add" ? "auto 120px 120px" : "1fr"};
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
`

const partitionByOptions = ["NONE", "HOUR", "DAY", "MONTH", "YEAR"]

type Props = {
  action: Action
  open: boolean
  isEditLocked: boolean
  hasWalSetting: boolean
  walEnabled?: boolean
  onOpenChange: (openedFileName?: string) => void
  onSchemaChange: (values: SchemaFormValues) => void
  name: string
  schema: SchemaColumn[]
  partitionBy: string
  timestamp: string
  trigger?: React.ReactNode
  tables?: QuestDB.Table[]
  ctaText: string
}

export const Dialog = ({
  action,
  name,
  schema,
  partitionBy,
  timestamp,
  open,
  isEditLocked,
  hasWalSetting,
  walEnabled,
  onOpenChange,
  onSchemaChange,
  trigger,
  tables,
  ctaText,
}: Props) => {
  const formDefaults = {
    name,
    schemaColumns: schema,
    partitionBy,
    timestamp,
    walEnabled: hasWalSetting ? "false" : undefined,
  }

  const [defaults, setDefaults] = useState<SchemaFormValues>(formDefaults)
  const [currentValues, setCurrentValues] =
    useState<SchemaFormValues>(formDefaults)
  const [lastFocusedIndex, setLastFocusedIndex] = useState<number | undefined>()
  const dispatch = useDispatch()

  const resetToDefaults = () => {
    setDefaults({
      name: name,
      schemaColumns: schema,
      partitionBy: partitionBy,
      timestamp: timestamp,
      walEnabled:
        hasWalSetting && walEnabled !== undefined
          ? walEnabled.toString()
          : undefined,
    })
  }

  const validationSchema = Joi.object({
    name: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (!isValidTableName(value)) {
          return helpers.error("string.validTableName")
        }
        if (
          action === "add" &&
          tables?.find((table) => table.table_name === value)
        ) {
          return helpers.error("string.uniqueTableName")
        }
        return value
      })
      .messages({
        "string.empty": "Please enter a name",
        "string.validTableName": "Invalid table name",
        "string.uniqueTableName": "Table name must be unique",
      }),
    partitionBy: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (value !== "NONE" && currentValues.timestamp === "") {
          return helpers.error("string.timestampRequired")
        }
        return value
      })
      .messages({
        "string.timestampRequired":
          "Designated timestamp is required when partitioning is set to anything other than NONE",
      }),
    walEnabled: Joi.any()
      .allow(...["true", "false"])
      .empty(),
    timestamp: Joi.string().allow(""),
    schemaColumns: Joi.array()
      .custom((value, helpers) => {
        if (action === "add" && value.length === 0) {
          return helpers.error("array.required")
        }
        return value
      })
      .unique((a, b) => a.name === b.name)
      .messages({
        "array.required": "Please add at least one column",
        "array.unique": "Column names must be unique",
      }),
  })

  useEffect(() => {
    if (schema) {
      resetToDefaults()
    }
  }, [schema])

  useEffect(() => {
    if (open) {
      setLastFocusedIndex(undefined)
    }
  }, [open])

  const columnCount = defaults.schemaColumns.length
  const tableNameArray = tables?.map((table) => {
    const tableName = table.table_name
    return tableName
  }) ?? []
  const filterTableNameArray = tableNameArray.filter((item) => item.startsWith('FOLDER_'))
  const datasetIdOptions = filterTableNameArray.map((item) => item.replace('FOLDER_', ''))
  return (
    <Drawer
      mode={(action === "add" || action === "export" ) ? "side" : "modal"}
      open={open}
      trigger={
        trigger ?? (
          <Button
            skin={columnCount > 0 ? "transparent" : "secondary"}
            prefixIcon={
              columnCount > 0 ? <Edit size="18px" /> : <TableIcon size="18px" />
            }
            onClick={() => onOpenChange(name)}
          >
            {columnCount > 0
              ? `${columnCount} col${columnCount > 1 ? "s" : ""}`
              : "Add"}
          </Button>
        )
      }
      onDismiss={() => {
        resetToDefaults()
        onOpenChange(undefined)
      }}
      onOpenChange={(isOpen) => {
        if (isOpen && action === "add") {
          dispatch(
            actions.console.setActiveSidebar(isOpen ? "create" : undefined),
          )
        }
      }}
    >
      <StyledContentWrapper mode={ "side" }>
        <Form<SchemaFormValues>
          name="table-schema"
          defaultValues={defaults}
          onSubmit={(values) => {
            onSchemaChange(values)
            onOpenChange(undefined)
          }}
          onChange={(values) => setCurrentValues(values as SchemaFormValues)}
          validationSchema={validationSchema}
        >
          <Panel.Header
            title={"Export Data to CSV file"}
            afterTitle={
              <Actions
                ctaText={ctaText}
              />
            }
          />
          <Items>
            <Inputs>
              <Drawer.GroupItem direction="column">
                <Controls action={action}>
                  {action === "add" && (
                    <Form.Item name="name" label="Table name">
                      <Form.Input name="name" autoComplete="off" />
                    </Form.Item>
                  )}
                  <Box align="flex-end">
                    <Form.Item
                      name="datasetId"
                      required
                      label={
                        <PopperHover
                          trigger={
                            <Box
                              align="center"
                              justifyContent="center"
                              gap="0.5rem"
                            >
                              <InfoCircle size="14" />
                              <span>Dataset ID</span>
                            </Box>
                          }
                          placement="bottom"
                        >
                          <Tooltip>
                            An ID of the dataset to be exported.
                          </Tooltip>
                        </PopperHover>
                      }
                    >
                      <Form.Select
                        name="datasetId"
                        options={datasetIdOptions.map((item) => ({
                          label: item,
                          value: item,
                        }))}
                      />
                    </Form.Item>
                  </Box>
                  <Box align="flex-end">
                    <Form.Item
                      name="samplingInterval"
                      label={
                        <PopperHover
                          trigger={
                            <Box
                              align="center"
                              justifyContent="center"
                              gap="0.5rem"
                            >
                              <InfoCircle size="14" />
                              <span>Sampling Interval (seconds)</span>
                            </Box>
                          }
                          placement="bottom"
                        >
                          <Tooltip>
                            An interval in seconds to sample data. If not set, all data will be exported.
                          </Tooltip>
                        </PopperHover>
                      }
                    >
                      <Form.Input
                        name="samplingInterval"
                      />
                    </Form.Item>
                  </Box>
                  <Box align="flex-end">
                    <Form.Item
                      name="sampleSpeed"
                      label={
                        <PopperHover
                          trigger={
                            <Box
                              align="center"
                              justifyContent="center"
                              gap="0.5rem"
                            >
                              <InfoCircle size="14" />
                              <span>Sampling seed (seconds)</span>
                            </Box>
                          }
                          placement="bottom"
                        >
                          <Tooltip>
                            A seed in seconds to sample data. If not set, all data will be exported.
                            Note: this values required the sampling interval to be set.
                          </Tooltip>
                        </PopperHover>
                      }
                    >
                      <Form.Input
                        name="samplingInterval"
                      />
                    </Form.Item>
                  </Box>
                  <Box align="flex-end">
                    <Form.Item
                      name="beginDt"
                      label={
                        <PopperHover
                          trigger={
                            <Box
                              align="center"
                              justifyContent="center"
                              gap="0.5rem"
                            >
                              <InfoCircle size="14" />
                              <span>Beginning Date/Time</span>
                            </Box>
                          }
                          placement="bottom"
                        >
                          <Tooltip>
                            Date and time to start exporting data from. If not set, all data will be exported.
                            Note, to reset the value, please clear the input field by select "clear" on the picker.
                          </Tooltip>
                        </PopperHover>
                      }
                    >
                      <Form.Input
                        type="datetime-local"
                        name="beginDt"
                      />
                    </Form.Item>
                  </Box>
                  <Box align="flex-end">
                    <Form.Item
                      name="endDt"
                      label={
                        <PopperHover
                          trigger={
                            <Box
                              align="center"
                              justifyContent="center"
                              gap="0.5rem"
                            >
                              <InfoCircle size="14" />
                              <span>Ending Date/Time</span>
                            </Box>
                          }
                          placement="bottom"
                        >
                          <Tooltip>
                            Date and time to stop exporting data from. If not set, all data will be exported.
                            Note, to reset the value, please clear the input field by select "clear" on the picker.
                          </Tooltip>
                        </PopperHover>
                      }
                    >
                      <Form.Input
                        type="datetime-local"
                        name="endDt"
                      />
                    </Form.Item>
                  </Box>
                  <Box align="flex-end">
                    <Form.Item
                      name="limit"
                      label={
                        <PopperHover
                          trigger={
                            <Box
                              align="center"
                              justifyContent="center"
                              gap="0.5rem"
                            >
                              <InfoCircle size="14" />
                              <span>Number of records</span>
                            </Box>
                          }
                          placement="bottom"
                        >
                          <Tooltip>
                            A number to limit number of records to be exported. If not set, all data will be exported.
                          </Tooltip>
                        </PopperHover>
                      }
                    >
                      <Form.Input
                        name="limit"
                      />
                    </Form.Item>
                  </Box>
                </Controls>
              </Drawer.GroupItem>
            </Inputs>
          </Items>
        </Form>
      </StyledContentWrapper>
    </Drawer>
  )
}
