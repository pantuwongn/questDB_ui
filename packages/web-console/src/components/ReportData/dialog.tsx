import React, { useEffect, useState, CSSProperties } from "react"
import { Button } from "@questdb/react-components"
import { Box } from "../Box"
import { Text } from "../Text"
import styled from "styled-components"
import { Table as TableIcon, Edit } from "@styled-icons/remix-line"
import { InfoCircle } from "@styled-icons/boxicons-regular"
import { Drawer } from "../Drawer"
import { PopperHover } from "../PopperHover"
import { Tooltip } from "../Tooltip"
import { Action } from "./types"
import * as QuestDB from "../../utils/questdb"
import { useDispatch } from "react-redux"
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

const Title = styled(Text)`
  display: flex;
  align-items: left;
  padding-left: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 10px;
  width: 100%;
`
const Section = styled(Box).attrs({ gap: "0", flexDirection: "row" })`
  display: flex;
  align-items: left;
  padding-left: 1rem;
  font-size: 1.7rem;
  font-weight: 500;
  margin: 15px;
  width: 100%;
`

type Props = {
  action: Action
  open: boolean
  trigger?: React.ReactNode
  tables?: QuestDB.Table[]
}

export const Dialog = ({
  action,
  open,
  tables,
  trigger,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [lastFocusedIndex, setLastFocusedIndex] = useState<number | undefined>()
  const dispatch = useDispatch()

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  const tableNameArray = tables?.map((table) => {
    const tableName = table.table_name
    return tableName
  }) ?? []
  const filterTableNameArray = tableNameArray.filter((item) => item.startsWith('FOLDER_'))
  const datasetIdOptions = filterTableNameArray.map((item) => item.replace('FOLDER_', ''))

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
    >
      <StyledContentWrapper mode={ "side" }>
        <Title color="foreground">Dataset Status Report</Title>
        <br/>
        <Section color="foreground">Database:</Section>
          
      </StyledContentWrapper>
    </Drawer>
  )
}
