import React, { useEffect, useState } from "react"
import { Dialog as ReportDataDialog } from "../../components/ReportData/dialog"
import { useDispatch, useSelector } from "react-redux"
import { selectors, actions } from "../../store"
import { FileChart as ReportIcon } from "@styled-icons/remix-line"
import { PrimaryToggleButton } from "../../components"
import { BUTTON_ICON_SIZE } from "../../consts"
import { IconWithTooltip } from "../../components/IconWithTooltip"

export const ReportDialog = () => {
  const [reportDialogOpen, setReportDialogOpen] = useState<
    string | undefined
  >(undefined)
  const dispatch = useDispatch()
  const tables = useSelector(selectors.query.getTables)
  const activeSidebar = useSelector(selectors.console.getActiveSidebar)
  const { readOnly } = useSelector(selectors.console.getConfig)

  const loadReport = () => {
    const url = process.env.BE_URL;
    const user = process.env.BE_USER;
    const password = process.env.BE_PASS;
    let endpoint = `${url}/report`;
    const userPassword = `${user}:${password}`;
    fetch(endpoint, {
        headers: {
          'Authorization': 'Basic ' + btoa(userPassword)
        }
    }).then(async (response) => {
      console.log(response);
    }).catch(error => console.log(error));
  };
  loadReport();
  useEffect(() => {
    setReportDialogOpen(activeSidebar === "report" ? "report" : undefined)
  }, [activeSidebar])

  useEffect(() => {
    if (reportDialogOpen !== undefined) {
      dispatch(actions.console.setActiveSidebar("report"))
    }
  }, [reportDialogOpen])

  return (
    <ReportDataDialog
      action="report"
      tables={tables}
      open={reportDialogOpen !== undefined}
      trigger={
        <IconWithTooltip
          icon={
            <PrimaryToggleButton
              data-hook="export-panel-button"
              readOnly={readOnly}
              selected={reportDialogOpen !== undefined}
              {...(!readOnly && {
                onClick: () => {
                  dispatch(
                    actions.console.setActiveSidebar(
                      reportDialogOpen ? undefined : "report",
                    ),
                  )
                },
              })}
            >
              <ReportIcon size={BUTTON_ICON_SIZE} />
            </PrimaryToggleButton>
          }
          placement="left"
          tooltip={
            "View dataset status report."
          }
        />
      }
      ctaText="Report"
    />
  )
}
