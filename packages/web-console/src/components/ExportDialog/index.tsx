import React, { useEffect, useState } from "react"
import { Dialog as ExportCSVDialog } from "../../components/ExportCSVDialog/dialog"
import { useDispatch, useSelector } from "react-redux"
import { selectors, actions } from "../../store"
import { FileExcel2 as FileIcon } from "@styled-icons/remix-line"
import { SchemaFormValues } from "components/ExportCSVDialog/types"
import { formatTableSchemaQuery } from "../../utils/formatTableSchemaQuery"
import { useEditor } from "../../providers"
import { PrimaryToggleButton } from "../../components"
import { BUTTON_ICON_SIZE } from "../../consts"
import { IconWithTooltip } from "../../components/IconWithTooltip"

export const ExportDialog = () => {
  const [exportDialogOpen, setExportDialogOpen] = useState<
    string | undefined
  >(undefined)
  const dispatch = useDispatch()
  const tables = useSelector(selectors.query.getTables)
  const activeSidebar = useSelector(selectors.console.getActiveSidebar)
  const { readOnly } = useSelector(selectors.console.getConfig)
  const { appendQuery } = useEditor()

  const handleAddTableSchema = (values: SchemaFormValues) => {
    
  }

  useEffect(() => {
    setExportDialogOpen(activeSidebar === "export" ? "export" : undefined)
  }, [activeSidebar])

  useEffect(() => {
    if (exportDialogOpen !== undefined) {
      dispatch(actions.console.setActiveSidebar("export"))
    }
  }, [exportDialogOpen])

  return (
    <ExportCSVDialog
      action="export"
      isEditLocked={false}
      hasWalSetting={true}
      walEnabled={false}
      name=""
      partitionBy="NONE"
      schema={[]}
      tables={tables}
      timestamp=""
      onOpenChange={(open) => setExportDialogOpen(open)}
      open={exportDialogOpen !== undefined}
      onSchemaChange={handleAddTableSchema}
      trigger={
        <IconWithTooltip
          icon={
            <PrimaryToggleButton
              data-hook="export-panel-button"
              readOnly={readOnly}
              selected={exportDialogOpen !== undefined}
              {...(!readOnly && {
                onClick: () => {
                  dispatch(
                    actions.console.setActiveSidebar(
                      exportDialogOpen ? undefined : "export",
                    ),
                  )
                },
              })}
            >
              <FileIcon size={BUTTON_ICON_SIZE} />
            </PrimaryToggleButton>
          }
          placement="left"
          tooltip={
            "Export data to a CSF file."
          }
        />
      }
      ctaText="Export"
    />
  )
}
