import React, { useEffect, useState, CSSProperties } from "react"
import { Button } from "@questdb/react-components"
import { Box } from "../Box"
import { Text } from "../Text"
import styled from "styled-components"
import { Table as TableIcon, Edit } from "@styled-icons/remix-line"
import { InfoCircle } from "@styled-icons/boxicons-regular"
import { Form } from "../Form"
import { Drawer } from "../Drawer"
import { PopperHover } from "../PopperHover"
import { Tooltip } from "../Tooltip"
import { Action, ExportFormValues } from "./types"
import Joi from "joi"
import * as QuestDB from "../../utils/questdb"
import { useDispatch } from "react-redux"
import { actions } from "../../store"
import { Panel } from "../../components/Panel"
import { Actions } from "./actions"
import GridLoader from "react-spinners/GridLoader";

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
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
`

type Props = {
  action: Action
  open: boolean
  onOpenChange: (openedFileName?: string) => void
  onFormChange: (values: ExportFormValues) => void
  datasetId: string
  samplingInterval?: number
  samplingSeed?: number
  beginDt?: string
  endDt?: string
  limit?: number
  trigger?: React.ReactNode
  tables?: QuestDB.Table[]
  ctaText: string
}

export const Dialog = ({
  action,
  datasetId,
  samplingInterval,
  samplingSeed,
  beginDt,
  endDt,
  limit,
  open,
  onOpenChange,
  onFormChange,
  tables,
  trigger,
  ctaText,
}: Props) => {
  const formDefaults = {
    datasetId,
    samplingInterval,
    samplingSeed,
    beginDt,
    endDt,
    limit
  }

  const [loading, setLoading] = useState(false);
  setLoading(true);
  console.log(loading)
  const [color, setColor] = useState("#ffffff");
  const [defaults, setDefaults] = useState<ExportFormValues>(formDefaults)
  const [currentValues, setCurrentValues] =
    useState<ExportFormValues>(formDefaults)
  const [lastFocusedIndex, setLastFocusedIndex] = useState<number | undefined>()
  const dispatch = useDispatch()

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const resetToDefaults = () => {
    setDefaults({
      datasetId: datasetId,
      samplingInterval: samplingInterval,
      samplingSeed: samplingSeed,
      beginDt: beginDt,
      endDt: endDt,
      limit: limit
    })
  }

  const tableNameArray = tables?.map((table) => {
    const tableName = table.table_name
    return tableName
  }) ?? []
  const filterTableNameArray = tableNameArray.filter((item) => item.startsWith('FOLDER_'))
  const datasetIdOptions = filterTableNameArray.map((item) => item.replace('FOLDER_', ''))

  const isValidDateTimeFormat = (value: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    return regex.test(value);
  };

  const validationExportForm = Joi.object({
    datasetId: Joi.string()
      .required()
      .custom((value, helpers) => {
        const tableName = `FOLDER_${value}`
        console.log( tableNameArray, tableName, tableNameArray.includes(tableName))
        if (!tableNameArray.includes(tableName)) {
          return helpers.error("string.validDatasetId")
        } else if (!value) {
          return helpers.error("string.datasetIdRequired")
        }
        return value
      })
      .messages({
        "string.validDatasetId": "Invalid dataset id",
        "string.datasetIdRequired": "Dataset ID is required",
      }),
    samplingInterval: Joi.number()
      .allow(null, '')
      .integer()
      .min(0),
    samplingSeed: Joi.number()
      .allow(null, '')
      .integer()
      .min(0),
    beginDt: Joi.string()
    .allow(null, '')
    .custom((value, helpers) => {
      if (!isValidDateTimeFormat(value)) {
        return helpers.error("string.validDatetimeFormat")
      }
      return value
    })
    .messages({
      "string.validDatetimeFormat": "Datetime format is wrong. It must be yyyy-mm-ddTHH:MM such as 2024-04-01T10:30",
    }),
    endDt: Joi.string()
    .allow(null, '')
    .custom((value, helpers) => {
      if (!isValidDateTimeFormat(value)) {
        return helpers.error("string.validDatetimeFormat")
      }
      return value
    })
    .messages({
      "string.validDatetimeFormat": "Datetime format is wrong. It must be yyyy-mm-ddTHH:MM such as 2024-04-01T10:30",
    }),
    limit: Joi.number()
      .allow(null, '')
      .integer()
      .min(1),
  })

  useEffect(() => {
    if (open) {
      setLastFocusedIndex(undefined)
    }
  }, [open])

  return (
    <Drawer
      mode={ "side" }
      open={open}
      trigger={ trigger }
      onDismiss={() => {
        resetToDefaults()
        onOpenChange(undefined)
      }}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          dispatch(
            actions.console.setActiveSidebar("export"),
          )
        }
      }}
    >
      <StyledContentWrapper mode={ "side" }>
        <Form<ExportFormValues>
          name="export-data-form"
          defaultValues={defaults}
          onSubmit={(values) => {
            setLoading(true);
            console.log(loading)
            onFormChange(values);
            setLoading(false);
            console.log(loading)
          }}
          onChange={(values) => setCurrentValues(values as ExportFormValues)}
          validationExportForm={validationExportForm}
        >
          <Panel.Header
            title={"Export Data to CSV file"}
            afterTitle={
              <Box align="flex-end">
                <GridLoader
                  color={color}
                  loading={loading}
                  size={5}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
                <Actions
                  ctaText={ctaText}
                  loading={loading}
                />
              </Box>
            }
          />
          <Items>
            <Inputs>
              <Drawer.GroupItem direction="column">
                <Controls action={action}>
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
                      name="samplingSeed"
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
                        name="samplingSeed"
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
