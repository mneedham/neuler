import React from 'react'
import {Form, Button, Checkbox} from "semantic-ui-react"
import CentralityForm from "./CentralityForm"

export default ({ onChange, labelOptions, relationshipTypeOptions, writeProperty, direction, persist, concurrency, maxDepth }) => (
  <Form size='mini' style={{ marginBottom: '1em' }}>
    <CentralityForm onChange={onChange} direction={direction} persist={persist} writeProperty={writeProperty} concurrency={concurrency} labelOptions={labelOptions} relationshipTypeOptions={relationshipTypeOptions} />

  </Form>
)
