import React from 'react';
import ReactDOM from 'react-dom';
import { createMuiTheme, ThemeProvider, withStyles } from '@material-ui/core/styles';
import { Button, ButtonProps } from '@material-ui/core';
import { purple } from '@material-ui/core/colors';
import styled from 'styled-components';
import CheckIcon from '@material-ui/icons/Check';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Rbac from '../src';
import JSONViewer from './viewer';
import { PermissionsObject } from '../src/types';

export const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#4994E4',
            light: '#3C74C3',
        },
        info: {
            main: '#D6EBFF',
        },
        text: {
            primary: '#363C44',
        },
    },
    overrides: {
        MuiTableCell: {
            root: {
                fontSize: '14px',
                padding: '5px 15px',
                borderBottom: 0,
            },
        },
    },
});

const data = {
    _resources: {
        asdf: {
            name: 'asdf',
            _resources: {
                'asdf.dd': {
                    name: 'asdf',
                    _resources: {
                        'asdf.dd.ff': {
                            name: 'ff',
                            _resources: {},
                        },
                    },
                },
            },
        },
        asdf123: {
            name: 'asdf123',
            _resources: {},
        },
        asdfasdf: {
            name: 'asdfa',
            _resources: {},
        },
        fff: {
            name: 'asdfadsf',
            _resources: {},
        },
        asdasdasd: {
            name: 'asasdasd',
            _resources: {},
        },
    },
    _roles: {
        user: {
            permissions: ['asdf'],
        },
        admin: {
            permissions: ['asdf123'],
        },
        'super admin': {
            permissions: [],
        },
        A1: {
            permissions: [],
        },
        A2: {
            permissions: [],
        },
        A4: {
            permissions: [],
        },
    },
};

const colorButton = withStyles((theme) => ({
    root: {
        color: theme.palette.getContrastText(purple[500]),
        backgroundColor: purple[500],
        '&:hover': {
            backgroundColor: purple[700],
        },
    },
}))(Button);

const colorButtonWithIcon = (props: ButtonProps) => {
    const Button = colorButton;
    return (
        <Button onClick={props.onClick}>
            <CheckIcon />
        </Button>
    );
};

const addIcon = styled(AddCircleOutlineIcon)`
    background: red;
    color: black;

    &.MuiSvgIcon-colorError {
        color: black;
    }
`;

const App = () => {
    const [rbacData, setRbacData] = React.useState<PermissionsObject>(data);

    const handleChange = (value: PermissionsObject) => {
        setRbacData(value);
    };

    return (
        <ThemeProvider theme={theme}>
            <Rbac
                defaultValue={data}
                onChange={handleChange}
                buttons={
                    {
                        // cancelButton: colorButtonWithIcon,
                        // closeButton: colorButton,
                        // saveButton: colorButton,
                        // deleteButton: colorButtonWithIcon,
                    }
                }
                // icons={{
                //     editIcon: colorButton,
                //     deleteIcon: colorButton,
                //     treeNodeIcon: addIcon,
                //     treeParentIcon: addIcon,
                //     treeCollapseIcon: addIcon,
                //     treeExpandIcon: addIcon,
                // }}
                // components={{
                //     addResource: () => { return <>Test</> },
                //     addRole: () => { return <>Test 1</> },
                //     roleTag: (props) => { return <>{props.children}</> }
                // }}
            />
            <JSONViewer data={rbacData} />
        </ThemeProvider>
    );
};

ReactDOM.render(<App />, document.querySelector('#root'));
