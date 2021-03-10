import React, { useEffect, ComponentType } from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Block';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowRight from '@material-ui/icons/ArrowRight';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import MenuIcon from '@material-ui/icons/Menu';
import { getAllResources } from './utils';
import TreeBlock from './TreeBlock';
import AddResource from './Components/AddResource';
import AddRole from './Components/AddRole';
import RoleTag from './Components/RoleTag';
import CheckboxTableContainer from './Components/CheckboxTableContainer';
import CheckboxBlock from './CheckboxBlock';
import { PermissionsObject, ResourcesItem } from './types';

const EMPTY_RBAC_OBJECT = { _resources: {}, _roles: {} };

export interface ButtonsInterface {
    cancelButton?: ComponentType;
    closeButton?: ComponentType;
    saveButton?: ComponentType;
    deleteButton?: ComponentType;
}

export interface IconsInterface {
    editIcon?: ComponentType;
    deleteIcon?: ComponentType;
    treeAddIcon?: ComponentType;
    treeDeleteIcon?: ComponentType;
    treeEditIcon?: ComponentType;
    treeNodeIcon?: ComponentType;
    treeParentIcon?: ComponentType;
    treeCollapseIcon?: ComponentType;
    treeExpandIcon?: ComponentType;
}

export interface ComponentsInterface {
    addResource?: ComponentType;
    addRole?: ComponentType;
    roleTag?: ComponentType;
    checkboxTableContainer?: ComponentType;
}

interface RbacProps {
    defaultValue?: PermissionsObject;
    onChange(data: { [index: string]: any }): void;
    resourceForbiddenCharsRegex?: RegExp;
    buttons?: ButtonsInterface;
    icons?: IconsInterface;
    components?: ComponentsInterface;
}

const Rbac = ({
    defaultValue = EMPTY_RBAC_OBJECT,
    onChange,
    resourceForbiddenCharsRegex,
    buttons = {},
    icons = {},
    components = {},
}: RbacProps) => {
    const [permissionsTable, setPermissionsTable] = React.useState<PermissionsObject>(defaultValue);
    const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
    const [nodesWithChildren, setNodesWithChildren] = React.useState([]);

    useEffect(() => {
        setExpandedItems(getAllResources(permissionsTable));
    }, []);

    useEffect(() => {
        if (!permissionsTable) {
            return;
        }
        setNodesWithChildren(getAllNodesWithChildren());
    }, [permissionsTable]);

    const getAllNodesWithChildren = () => {
        const recurse = (resource: any) => {
            let ret: any = [];
            if (!resource.hasOwnProperty('_resources')) {
                return ret;
            }

            Object.keys(resource._resources).forEach((item) => {
                if (Object.keys(resource._resources[item]._resources).length > 0) {
                    ret.push(item);
                }
                ret = [...ret, ...recurse(resource._resources[item])]
            });

            return ret;
        };

        return recurse(permissionsTable);
    };

    const handleCheckboxChanges = (newData: PermissionsObject) => {
        setPermissionsTable(newData);
        const ret: PermissionsObject = { _resources: {}, _roles: {} };

        Object.keys(newData._roles).forEach((item) => {
            ret._roles[item] = newData._roles[item];
        });

        ret._resources = newData._resources;
        onChange(ret);
    };

    const handleResourceChanges = (newResources: ResourcesItem, isDelete: boolean) => {
        const newPermissions = Object.assign({}, permissionsTable, newResources);

        if (isDelete) {
            const allAvailableResources = getAllResources(newPermissions);
            Object.keys(newPermissions._roles).forEach((item) => {
                newPermissions._roles[item].permissions = newPermissions._roles[item].permissions.filter((t: string) =>
                    allAvailableResources.includes(t)
                );
            });
        }

        setPermissionsTable(newPermissions);
        onChange(newPermissions);
    };

    const memoizedButtons = React.useMemo(() => {
        return {
            CancelButton: buttons.cancelButton || Button,
            CloseButton: buttons.closeButton || Button,
            DeleteButton: buttons.deleteButton || Button,
            SaveButton: buttons.saveButton || Button,
        };
    }, [buttons]);

    const memoizedIcons = React.useMemo(() => {
        return {
            EditIcon: icons.editIcon || EditIcon,
            DeleteIcon: icons.deleteIcon || DeleteIcon,
            TreeAddIcon: icons.treeAddIcon || AddCircleOutlineIcon,
            TreeEditIcon: icons.treeEditIcon || EditIcon,
            TreeDeleteIcon: icons.treeDeleteIcon || DeleteIcon,
            TreeNodeIcon: icons.treeNodeIcon || FiberManualRecord,
            TreeParentIcon: icons.treeParentIcon || MenuIcon,
            TreeCollapseIcon: icons.treeCollapseIcon || ArrowDropDown,
            TreeExpandIcon: icons.treeExpandIcon || ArrowRight,
        };
    }, [icons]);

    const memoizedComponents = React.useMemo(() => {
        return {
            AddResource: components.addResource || AddResource,
            AddRole: components.addRole || AddRole,
            RoleTag: components.roleTag || RoleTag,
            CheckboxTableContainer: components.checkboxTableContainer || CheckboxTableContainer,
        };
    }, [components]);

    return (
        <React.Fragment>
            {permissionsTable && (
                <StyledContainer>
                    <TreeBlock
                        resources={{
                            _resources: permissionsTable._resources,
                        }}
                        expandedItems={expandedItems}
                        setExpandedItems={setExpandedItems}
                        onChange={handleResourceChanges}
                        resourceForbiddenCharsRegex={resourceForbiddenCharsRegex}
                        buttons={memoizedButtons}
                        icons={memoizedIcons}
                        components={memoizedComponents}
                    />
                    <CheckboxBlock
                        permissionsTable={permissionsTable}
                        expandedItems={expandedItems}
                        nodesWithChildren={nodesWithChildren}
                        onChange={handleCheckboxChanges}
                        buttons={memoizedButtons}
                        icons={memoizedIcons}
                        components={memoizedComponents}
                    />
                </StyledContainer>
            )}
        </React.Fragment>
    );
};

export default Rbac;

const StyledContainer = styled.div`
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    width: 100%;
    display: flex;
    > div {
        width: 100%;
        flex-grow: 1;
    }
`;
