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

  const [loading, setLoading] = useState(false);

  const handleFormChange = (values: ExportFormValues) => {
    setLoading(true);
    const url = process.env.BE_URL;
    const user = process.env.BE_USER;
    const password = process.env.BE_PASS;
    let endpoint = `${url}/export?dataset_id=${values.datasetId}`;
    if (values.samplingInterval) {
      endpoint += `&sampling_interval=${values.samplingInterval}`;
    }
    if (values.samplingSeed) {
      endpoint += `&sampling_seed=${values.samplingSeed}`;
    }
    if (values.beginDt) {
      endpoint += `&begin_dt=${values.beginDt}`;
    }
    if (values.endDt) {
      endpoint += `&end_dt=${values.endDt}`;
    }
    if (values.limit) {
      endpoint += `&limit=${values.limit}`;
    }
    const userPassword = `${user}:${password}`;
    fetch(endpoint, {
        headers: {
          'Authorization': 'Basic ' + btoa(userPassword)
        }
    }).then(async (response) => {
      console.log('Get response')
      const csvContent = await response.text();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
      const element = document.createElement("a");
      element.href = URL.createObjectURL(blob);
      let filename = `export_data_${values.datasetId}`
      let rows = csvContent.split('\n');
      console.log('after split rows')
      if (rows.length > 1) {
        const header = rows[0].trim().split(',').map(item => item.trim());
        const collectionTimeIndex = header.indexOf('CollectionTime');
        const firstRow = rows[1].trim().split(',').map(item => item.trim());
        const lastRow = rows[rows.length - 2].trim().split(',').map(item => item.trim());
        const startCollectionDate = firstRow[collectionTimeIndex].split(' ')[0];
        const stopCollectionDate = lastRow[collectionTimeIndex].split(' ')[0];
        filename = `export_data_${values.datasetId}_${startCollectionDate}_${stopCollectionDate}.csv`;
      }
      element.download = filename;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      console.log("ExportDialog handleFormChange", values);
      setLoading(false);
    }).catch(error => {
      console.log(error);
      setLoading(false);
    });
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
      loading={loading}
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
