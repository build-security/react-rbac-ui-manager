import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';

import {
    ButtonsInterfaceInternal,
    ComponentsInterfaceInternal,
    IconsInterfaceInternal,
    PermissionsObject,
    ResourcesItem,
} from '../types';

interface CheckboxBlockProps {
    permissionsTable: PermissionsObject;
    onChange(data: PermissionsObject): void;
    expandedItems: string[];
    nodesWithChildren: string[];
    buttons: ButtonsInterfaceInternal;
    icons: IconsInterfaceInternal;
    components: ComponentsInterfaceInternal;
}

const CheckboxBlock = ({
    permissionsTable,
    onChange,
    expandedItems,
    nodesWithChildren,
    buttons: Buttons,
    icons: Icons,
    components: Components,
}: CheckboxBlockProps) => {
    const [modalIsOpen, setModalIsOpen] = React.useState<boolean>(false);
    const [currentModalRole, setCurrentModalRole] = React.useState<string>('');
    const [modalDeleteIsOpen, setModalDeleteIsOpen] = React.useState<boolean>(false);
    const [modalInEditMode, setModalInEditMode] = React.useState<boolean>(false);
    const [rolesOrdered, setRolesOrdered] = React.useState<string[]>([]);
    const [displayedRows, setDisplayedRows] = React.useState<string[]>([]);
    const [errorInRoleName, setErrorInRoleName] = React.useState<boolean>(false);
    const [errorHelperText, setErrorHelperText] = React.useState<string>('');
    const roleNameEl = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const roles = Object.keys(permissionsTable._roles);
        setRolesOrdered(roles);
    }, []);

    useEffect(() => {
        setDisplayedRows(generatedDisplayedRowsList({ _resources: permissionsTable._resources }));
    }, [permissionsTable, expandedItems]);

    const generatedDisplayedRowsList = (data: ResourcesItem): string[] => {
        let ret: string[] = [];
        Object.keys(data._resources).forEach((item) => {
            ret.push(item);
            if (expandedItems.indexOf(item) > -1) {
                ret = ret.concat(generatedDisplayedRowsList(data._resources[item]));
            }
        });

        return ret;
    };

    const isChecked = (role: string, perm: string): boolean => {
        return !!permissionsTable._roles[role]['permissions']?.includes(perm);
    };

    const isCheckedByParent = (role: string, perm: string): boolean => {
        let found = false;
        nodesWithChildren.every((item) => {
            if (perm.startsWith(`${item}.`) && permissionsTable._roles[role]['permissions']?.includes(item)) {
                found = true;
                return false;
            }
            return true;
        });

        return found;
    };

    const handleCheckboxChange = (checked: boolean, role: string, perm: string): void => {
        if (checked) {
            [...permissionsTable._roles[role]['permissions']].forEach((item) => {
                if (!item.startsWith(`${perm}.`)) {
                    return;
                }
                const pos = permissionsTable._roles[role]['permissions'].indexOf(item);
                if (pos > -1) {
                    permissionsTable._roles[role]['permissions'].splice(pos, 1);
                }
            });
            permissionsTable._roles[role]['permissions'].push(perm);
        } else {
            const pos = permissionsTable._roles[role]['permissions'].indexOf(perm);
            permissionsTable._roles[role]['permissions'].splice(pos, 1);
        }

        onChange({ ...permissionsTable });
    };

    const handleOpenModal = (role: string, isDeleteModal: boolean = false, isEditModal: boolean = false) => {
        setCurrentModalRole(role);
        setModalInEditMode(isEditModal);
        resetErrors();

        if (isDeleteModal) {
            return setModalDeleteIsOpen(true);
        }

        setModalIsOpen(true);
    };

    const handleCloseModal = (isDeleteModal = false) => {
        if (isDeleteModal) {
            return setModalDeleteIsOpen(false);
        }

        setModalIsOpen(false);
    };

    const handleDeleteRole = () => {
        delete permissionsTable._roles[currentModalRole];
        onChange(Object.assign({}, permissionsTable));
        setRolesOrdered(rolesOrdered.filter((item) => item !== currentModalRole));
        handleCloseModal(true);
    };

    const handleRole = () => {
        const roleName = roleNameEl?.current?.value || '';
        if (roleName === currentModalRole) {
            handleCloseModal();
            return false;
        }

        if (roleName in permissionsTable._roles) {
            setErrorHelperText('Role name already exists');
            setErrorInRoleName(true);
            return false;
        }

        if (modalInEditMode && currentModalRole) {
            permissionsTable._roles[roleName] = permissionsTable._roles[currentModalRole];
            delete permissionsTable._roles[currentModalRole];
            rolesOrdered[rolesOrdered.indexOf(currentModalRole)] = roleName;
            setRolesOrdered([...rolesOrdered]);
        } else {
            permissionsTable._roles[roleName] = { permissions: [] };
            rolesOrdered.push(roleName);
            setRolesOrdered([...rolesOrdered]);
        }

        onChange(Object.assign({}, permissionsTable));
        handleCloseModal();

        return false;
    };

    const resetErrors = () => {
        setErrorHelperText('');
        setErrorInRoleName(false);
    };

    return (
        <Components.CheckboxTableContainer>
            <Dialog
                open={modalIsOpen}
                onClose={() => {
                    handleCloseModal(false);
                }}
                disableBackdropClick
            >
                <DialogContainer>
                    <DialogTitle>Role</DialogTitle>
                    <DialogContent>
                        <InputRowContainer>
                            <InputLabel htmlFor="name">Role Name:</InputLabel>
                            <TextField
                                id="name"
                                type="text"
                                inputRef={roleNameEl}
                                style={{ flexGrow: 1 }}
                                defaultValue={modalInEditMode ? currentModalRole : undefined}
                                helperText={errorHelperText}
                                error={errorInRoleName}
                                autoFocus
                            />
                        </InputRowContainer>
                    </DialogContent>
                    <DialogActions>
                        <Buttons.CancelButton
                            variant="outlined"
                            onClick={() => {
                                handleCloseModal(false);
                            }}
                        >
                            Cancel
                        </Buttons.CancelButton>
                        <Buttons.SaveButton variant="contained" color="primary" onClick={handleRole}>
                            Save
                        </Buttons.SaveButton>
                    </DialogActions>
                </DialogContainer>
            </Dialog>
            <Dialog open={modalDeleteIsOpen} onClose={() => handleCloseModal(true)} disableBackdropClick>
                <DialogContainer>
                    <DialogTitle>Delete Resources</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete the role <b>{currentModalRole}</b>?
                        </Typography>
                        <Typography>This action cannot be undone.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Buttons.CancelButton variant="outlined" onClick={() => handleCloseModal(true)}>
                            Cancel
                        </Buttons.CancelButton>
                        <Buttons.DeleteButton variant="contained" onClick={handleDeleteRole}>
                            Delete
                        </Buttons.DeleteButton>
                    </DialogActions>
                </DialogContainer>
            </Dialog>
            <AddRoleBlock>
                <span
                    onClick={() => {
                        handleOpenModal('');
                    }}
                >
                    <Components.AddRole />
                </span>
            </AddRoleBlock>
            <StyledTable>
                <StyledTHead>
                    <TableRow>
                        {rolesOrdered.map((row) => (
                            <StyledCell key={row}>
                                <Components.RoleTag>{row}</Components.RoleTag>
                                <RoleActions>
                                    <Icons.EditIcon
                                        fontSize="small"
                                        onClick={() => {
                                            handleOpenModal(row, false, true);
                                        }}
                                    />
                                    <Icons.DeleteIcon
                                        fontSize="small"
                                        color="error"
                                        onClick={() => {
                                            handleOpenModal(row, true);
                                        }}
                                    />
                                </RoleActions>
                            </StyledCell>
                        ))}
                        <TableCell>&nbsp;</TableCell>
                    </TableRow>
                </StyledTHead>
                <TableBody>
                    {displayedRows.map((perm) => {
                        return (
                            <StyledRow key={perm}>
                                {rolesOrdered.map((role) => {
                                    const itemChecked = isChecked(role, perm);
                                    const itemCheckedByParent = isCheckedByParent(role, perm);
                                    return (
                                        <StyledCell key={`${role}-${perm}`}>
                                            <StyledCheckbox
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const checked = e.target.checked;
                                                    handleCheckboxChange(checked, role, perm);
                                                }}
                                                checked={itemChecked || itemCheckedByParent}
                                                disabled={itemCheckedByParent}
                                                color="primary"
                                                size="small"
                                            />
                                        </StyledCell>
                                    );
                                })}
                                <TableCell>&nbsp;</TableCell>
                            </StyledRow>
                        );
                    })}
                </TableBody>
            </StyledTable>
        </Components.CheckboxTableContainer>
    );
};

export default CheckboxBlock;

const StyledCheckbox = styled(Checkbox)`
    &.MuiCheckbox-root {
        padding: 0;
    }

    svg {
        font-size: 17px;
    }
`;

const StyledTable = styled(Table)`
    &.MuiTable-root {
        width: auto;
    }
`;

const StyledTHead = styled(TableHead)`
    th {
        height: 34px;
    }
    .MuiTableCell-root {
        padding: 0 15px;
        border-bottom: 0;
    }
`;

const StyledRow = styled(TableRow)`
    border: 1px solid transparent;

    .MuiTableCell-root {
        line-height: 21px;
        font-size: 14px;
        padding: 5px 15px;
        border-bottom: 0;
    }
`;

const StyledCell = styled(TableCell)`
    padding: 0 15px;
    min-width: 100px;
    max-width: 150px;

    &.MuiTableCell-root {
        text-align: center;
    }
`;

const RoleActions = styled.div`
    margin-top: 4px;

    & svg {
        cursor: pointer;
        opacity: 0.3;
    }
    &:hover svg {
        opacity: 0.7;
    }
    &:hover svg:hover {
        opacity: 1;
    }
`;

const DialogContainer = styled.div`
    padding: 15px;
    min-width: 450px;
`;

const AddRoleBlock = styled(Typography)`
    height: 27px;
    padding-left: 14px;
    padding-top: 5px;
    position: sticky;
    left: 0;

    span {
        cursor: pointer;
    }
`;

const InputRowContainer = styled.div`
    display: flex;

    .MuiFormLabel-root {
        padding-top: 8px;
    }
`;
