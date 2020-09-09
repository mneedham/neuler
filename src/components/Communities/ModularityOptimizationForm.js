import React from 'react'
import {Dropdown, Form, Label, Segment} from "semantic-ui-react"
import {ProjectedGraphWithWeights} from "../Form/ProjectedGraph";
import {StoreProperty} from "../Form/StoreProperty";

const AlgoForm = ({onChange, labelOptions, maxIterations, tolerance, label, relationshipType, relationshipTypeOptions, relationshipOrientationOptions, propertyKeyOptions, weightProperty, writeProperty, seedProperty, defaultValue, direction, persist}) => {
    const projectedGraphProps = {
        label,
        labelOptions,
        relationshipType,
        direction,
        relationshipTypeOptions,
        relationshipOrientationOptions,
        propertyKeyOptions,
        weightProperty,
        defaultValue,
        onChange
    }

    const parameterProps = {
        propertyKeyOptions, seedProperty, maxIterations, onChange, tolerance
    }

    return (
        <Form style={{marginBottom: '1em'}}>
            <ProjectedGraphWithWeights {...projectedGraphProps} />
            <Parameters {...parameterProps} />
            <StoreProperty persist={persist} onChange={onChange} writeProperty={writeProperty}/>
        </Form>
    )
}

const Parameters = ({propertyKeyOptions, seedProperty, maxIterations, onChange, tolerance}) => {
    return <Segment key={propertyKeyOptions}>
        <Label as='a' attached='top left'>
            Algorithm Parameters
        </Label>
        <Form.Field inline>
            <label style={{'width': '12em'}}>Iterations</label>
            <input
                type='number'
                min={1}
                max={50}
                step={1}
                value={maxIterations}
                onChange={evt => onChange('maxIterations', evt.target.value)}
                style={{'width': '5em'}}
            />
        </Form.Field>

        <Form.Field inline>
            <label style={{'width': '12em'}}>Tolerance</label>
            <input
                value={tolerance}
                onChange={evt => onChange('tolerance', evt.target.value)}
                style={{'width': '7em'}}
            />
        </Form.Field>
        <Form.Field inline>
            <label style={{'width': '12em'}}>Seed Property</label>
            <Dropdown placeholder='Seed Property' defaultValue={seedProperty} fluid search selection
                      options={propertyKeyOptions} onChange={(evt, data) => onChange("seedProperty", data.value)}/>

        </Form.Field>
    </Segment>
}

export default AlgoForm