import React, {useState} from 'react';
import {
    useSettingsButton,
    TablePickerSynced,
    ViewPickerSynced,
    FieldPickerSynced,
    FormField,
    Box,
    Button,
} from '@airtable/blocks/ui';
import {FieldType} from '@airtable/blocks/models';

export default function Settings({table, globalConfig}) {
    return(
        <Box padding={3} >
            <FormField label="Table">
                <TablePickerSynced globalConfigKey="selectedTableId" />
            </FormField>
            <FormField label="View">
                <ViewPickerSynced table={table} globalConfigKey="selectedViewId" />
            </FormField>
            <FormField label="Done Field">
                <FieldPickerSynced
                    table={table}
                    globalConfigKey="selectedDoneFieldId"
                    placeholder="Pick a 'done' field..."
                    allowedTypes={[FieldType.CHECKBOX]}
                />
            </FormField>
            <FormField label="Cities Field">
                <FieldPickerSynced
                    table={table}
                    globalConfigKey="citiesFieldId"
                    placeholder="Pick a 'cities' field..."
                    allowedTypes={[FieldType.MULTIPLE_SELECTS]}
                />
            </FormField>
        </Box>
    )
}

