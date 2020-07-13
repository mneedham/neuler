import React from 'react'
import {Form} from "semantic-ui-react"
import CentralityForm from "./CentralityForm"

export default ({ onChange, labelOptions, relationshipType, relationshipTypeOptions, writeProperty, direction, persist, maxDepth, relationshipOrientationOptions }) => (
  <Form size='mini' style={{ marginBottom: '1em' }}>
    <CentralityForm onChange={onChange} direction={direction} relationshipType={relationshipType} persist={persist} writeProperty={writeProperty} labelOptions={labelOptions} relationshipOrientationOptions={relationshipOrientationOptions} relationshipTypeOptions={relationshipTypeOptions} />

  </Form>
)
