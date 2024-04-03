import React, { useEffect, useState } from "react"
import { Dialog as ExportCSVDialog } from "../../components/ExportCSVDialog/dialog"
import { useDispatch, useSelector } from "react-redux"
import { selectors, actions } from "../../store"
import { FileExcel2 as FileIcon } from "@styled-icons/remix-line"
import { ExportFormValues } from "components/ExportCSVDialog/types"
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

  const handleFormChange = (values: ExportFormValues) => {
    const url = process.env.BE_URL;
    const user = process.env.BE_USER;
    const password = process.env.BE_PASSWORD;
    fetch('http://188.166.235.85:8888/export?dataset_id=12T&sampling_interval=900&sampling_seed=60', {
        headers: {
          'Authorization': 'Basic ' + btoa('usseeerrrr:password')
        }
    }).then(async (response) => {
      const csvContent = await response.text();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      element.download = "export_data.csv";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }).catch(error => console.log(error));
    console.log("ExportDialog handleFormChange", values)
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
      datasetId=""
      tables={tables}
      onOpenChange={(open) => setExportDialogOpen(open)}
      open={exportDialogOpen !== undefined}
      onFormChange={handleFormChange}
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
