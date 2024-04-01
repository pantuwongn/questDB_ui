import React from "react"
import { Box } from "../Box"
import { FileExcel2 as FileIcon } from "@styled-icons/remix-line"
import { Form } from "../Form"
import type { Action } from "./types"

export const Actions = ({
  ctaText,
}: {
  ctaText: string
}) => {
  return (
    <Box gap="1rem">
      <Form.Submit prefixIcon={<FileIcon size={18} />} variant="success">
        {ctaText}
      </Form.Submit>
    </Box>
  )
}
