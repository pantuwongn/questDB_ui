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
  const [showLoadDescription, setShowLoadDescription] = useState(false);

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
      setLoading(false);
      setShowLoadDescription(true);
      const resp = await response.json();

      if (values.limit) {
        const dbEndPoint = `/exec?query=${encodeURIComponent(resp.sql)}`;
        fetch(dbEndPoint).then(async (response) => {
          const resp = await response.json();
          const columns = resp.columns.map((col: any) => col.name);
          let csvContent = columns.join(',') + '\n';
          for (let row of resp.dataset) {
            csvContent += row.join(',') + '\n';
          }
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
          const element = document.createElement("a");
          element.href = URL.createObjectURL(blob);
          element.download = resp.filename;
          document.body.appendChild(element); // Required for this to work in FireFox
          element.click();
          setShowLoadDescription(false);
        }).catch(error => {
          console.log(error);
        });
      }
      else {
        let numRows = resp.numRows;
        const dbEndPoint = `/exec?query=${encodeURIComponent(resp.sql)}`;
        let csvContent = ''
        let ep = '';
        console.log(numRows, dbEndPoint)
        for (let limit_1 = 1, limit_2 = 100000; (limit_1 == 1 || limit_2 <= numRows); limit_1 += 100000, limit_2 += 100000) {
          if (limit_1 == 1) {
            ep = `${dbEndPoint}&limit=${limit_2}`;
          }else{
            ep = `${dbEndPoint}&limit=${limit_1},${limit_2}`;
          }
          console.log(ep);
          const response = await fetch(ep);
          const resp = await response.json();
          console.log('get resp')
          if (limit_1 == 1) {
            const columns = resp.columns.map((col: any) => col.name);
            csvContent = columns.join(',') + '\n';
          }
          for (let row of resp.dataset) {
            csvContent += row.join(',') + '\n';
          }
        }
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = resp.filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        setShowLoadDescription(false);
      }
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
      showLoadDescription={showLoadDescription}
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
