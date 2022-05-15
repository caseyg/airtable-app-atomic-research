import React, {useState} from 'react';
import {
    useBase,
    useRecords,
    useGlobalConfig,
    useSettingsButton,
    expandRecord,
    Input,
    Button,
    Box,
    Icon,
} from '@airtable/blocks/ui';
import { MultiSelect } from 'primereact/multiselect';
import Settings from './components/Settings'
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function TodoApp() {
    const base = useBase();

    // Read the user's choice for which table and view to use from globalConfig.
    const globalConfig = useGlobalConfig();
    const tableId = globalConfig.get('selectedTableId');
    const viewId = globalConfig.get('selectedViewId');
    const doneFieldId = globalConfig.get('selectedDoneFieldId');
    const citiesFieldId = globalConfig.get('citiesFieldId');
    
    const table = base.getTableByIdIfExists(tableId);
    const view = table ? table.getViewByIdIfExists(viewId) : null;
    const doneField = table ? table.getFieldByIdIfExists(doneFieldId) : null;
    const citiesField = table ? table.getFieldByIdIfExists(citiesFieldId) : null;
    
    // Don't need to fetch records if doneField doesn't exist (the field or it's parent table may
    // have been deleted, or may not have been selected yet.)
    const records = useRecords(doneField ? view : null, {
        fields: doneField ? [table.primaryField, doneField, citiesField] : [],
    });

    const tasks = records
        ? records.map(record => {
              return <Task key={record.id} record={record} table={table} doneField={doneField} citiesField={citiesField} />;
          })
        : null;

    const canUpdateSettings = globalConfig.hasPermissionToSet()
    const [isShowingSettings, setIsShowingSettings] = useState(false)
    useSettingsButton(() => {
        setIsShowingSettings(!isShowingSettings)
    })

    // const onSaveSettings = useCallback(
    //       setIsShowingSettings(false)
    // )
    
    if (isShowingSettings) {
        return (
            <Settings globalConfig={globalConfig} table={table} />
        );
    }
    return (
        <>
            {tasks}
            {table && doneField && <AddTaskForm table={table} />}
        </>
    )
}


function Task({record, table, doneField, citiesField}) {
    function onChange(event) {
        table.updateRecordAsync(record, {
            [citiesField.id]: event.value,
        });
    }
    return (
        <Box
            fontSize={4}
            paddingX={3}
            paddingY={2}
            marginRight={-2}
            borderBottom="default"
            display="flex"
            alignItems="center"
        >
            <TaskDoneCheckbox table={table} record={record} doneField={doneField} />
            <a
                style={{cursor: 'pointer', flex: 'auto', padding: 8}}
                onClick={() => {
                    expandRecord(record);
                }}
            >
                {record.name || 'Unnamed record'}
            </a>
            <MultiSelect 
                filter 
                filterPlaceholder="Cities..."
                optionLabel="name" 
                display="chip" 
                showSelectAll="false"
                removeIcon="pi pi-times"
                value={record.getCellValue(citiesField)} 
                onChange={onChange} 
                options={citiesField.options.choices} 
                placeholder="Select a City" />
            <TaskDeleteButton table={table} record={record} />
        </Box>
);
}

function TaskDoneCheckbox({table, record, doneField}) {
    function onChange(event) {
        table.updateRecordAsync(record, {
            [doneField.id]: event.currentTarget.checked,
        });
    }

    const permissionCheck = table.checkPermissionsForUpdateRecord(record, {
        [doneField.id]: undefined,
    });

    return (
        <input
            type="checkbox"
            checked={!!record.getCellValue(doneField)}
            onChange={onChange}
            style={{marginRight: 8}}
            disabled={!permissionCheck.hasPermission}
        />
    );
}

function TaskDeleteButton({table, record}) {
    function onClick() {
        table.deleteRecordAsync(record);
    }

    return (
        <Button
            variant="secondary"
            marginLeft={1}
            onClick={onClick}
            disabled={!table.hasPermissionToDeleteRecord(record)}
        >
            <Icon name="x" style={{display: 'flex'}} />
        </Button>
    );
}

function AddTaskForm({table}) {
    const [taskName, setTaskName] = useState('');

    function onInputChange(event) {
        setTaskName(event.currentTarget.value);
    }

    function onSubmit(event) {
        event.preventDefault();
        table.createRecordAsync({
            [table.primaryField.id]: taskName,
        });
        setTaskName('');
    }

    // check whether or not the user is allowed to create records with values in the primary field.
    // if not, disable the form.
    const isFormEnabled = table.hasPermissionToCreateRecord({
        [table.primaryField.id]: undefined,
    });
    return (
        <>
            <form onSubmit={onSubmit}>
                <Box display="flex" padding={3}>
                    <Input
                        flex="auto"
                        value={taskName}
                        placeholder="New task"
                        onChange={onInputChange}
                        disabled={!isFormEnabled}
                    />
                    <Button variant="primary" marginLeft={2} type="submit" disabled={!isFormEnabled}>
                        Add
                    </Button>
                </Box>
            </form>
            <link rel="stylesheet" href="https://unpkg.com/primeicons/primeicons.css" />
        </>
    );
}
