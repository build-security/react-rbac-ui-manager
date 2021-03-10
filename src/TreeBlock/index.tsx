import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { withTheme } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import TreeView from '@material-ui/lab/TreeView';
import styled from 'styled-components';
import TableContainer from '@material-ui/core/TableContainer';
import TreeGenerator, { ItemResource, TreeItemContent, ActionsContainer } from './TreeGenerator';
import {
    ButtonsInterfaceInternal,
    ComponentsInterfaceInternal,
    FnTreeBlockHandleOpenModal,
    IconsInterfaceInternal,
    ResourcesItem,
    ThemeType,
} from '../types';

const DEFAULT_FORBIDDEN_CHARS_REGEX = /[^A-Za-z0-9]/g;

interface TreeBlockProps {
    resources: ResourcesItem;
    expandedItems: string[];
    setExpandedItems(expandItems: string[]): void;
    onChange(newData: ResourcesItem, isDelete?: boolean): void;
    resourceForbiddenCharsRegex: RegExp | undefined;
    buttons: ButtonsInterfaceInternal;
    icons: IconsInterfaceInternal;
    components: ComponentsInterfaceInternal;
}

const TreeBlock = ({
    resources,
    expandedItems,
    setExpandedItems,
    onChange,
    resourceForbiddenCharsRegex,
    buttons: Buttons,
    icons: Icons,
    components: Components,
}: TreeBlockProps) => {
    const [modalIsOpen, setModalIsOpen] = React.useState<boolean>(false);
    const [modalDeleteIsOpen, setModalDeleteIsOpen] = React.useState<boolean>(false);
    const [currentModalResourceKey, setCurrentModalResourceKey] = React.useState<string>('');
    const [currentModalResourceRef, setCurrentModalResourceRef] = React.useState<
        ResourcesItem | ResourcesItem['_resources']
    >();
    const [currentModalParentResourceRef, setCurrentModalParentResourceRef] = React.useState<
        ResourcesItem | ResourcesItem['_resources']
    >();
    const [modalInEditMode, setModalInEditMode] = React.useState<boolean>(false);
    const [permissionNameFirstFocus, setPermissionNameFirstFocus] = React.useState<boolean>(false);
    const [errorInPermission, setErrorInPermission] = React.useState<boolean>(false);
    const [errorHelperText, setErrorHelperText] = React.useState<string>('');
    const nameEl = React.useRef<HTMLInputElement>(null);
    const permissionEl = React.useRef<HTMLInputElement>(null);

    const handleResource = () => {
        const name = nameEl?.current?.value;
        const permission = `${currentModalResourceKey ? `${currentModalResourceKey}.` : ''}${
            permissionEl?.current?.value
        }`;
        const parent = currentModalResourceRef;

        if (parent && permission in parent._resources) {
            setErrorHelperText('Permission name already exists');
            setErrorInPermission(true);
            return;
        }

        if (modalInEditMode && currentModalResourceRef) {
            // @ts-ignore
            currentModalResourceRef.name = name;
        } else {
            if (parent) {
                // @ts-ignore
                parent._resources[permission] = {
                    name: name as string,
                    _resources: {},
                };
            }
        }

        onChange(Object.assign({}, resources));
        setExpandedItems(expandedItems.concat([permission]));
        handleCloseModal();
    };

    const handleDeleteResources = () => {
        if (currentModalParentResourceRef) {
            // @ts-ignore
            delete currentModalParentResourceRef[currentModalResourceKey];
        }

        onChange(Object.assign({}, resources), true);
        handleCloseModal(true);
    };

    const handleOpenModal: FnTreeBlockHandleOpenModal = (
        resourceRef,
        parentResourceRef,
        resourceKey = '',
        isDeleteModal = false,
        isEditModal = false
    ) => {
        setCurrentModalResourceRef(resourceRef);
        setCurrentModalParentResourceRef(parentResourceRef || resources);
        setCurrentModalResourceKey(resourceKey);
        setPermissionNameFirstFocus(true);
        setModalInEditMode(isEditModal);
        resetErrors();

        if (isDeleteModal) {
            return setModalDeleteIsOpen(true);
        }

        setModalIsOpen(true);
    };

    const handleCloseModal = (isDeleteModal = false) => {
        isDeleteModal ? setModalDeleteIsOpen(false) : setModalIsOpen(false);
    };

    const handleExpand = (_event: React.ChangeEvent<{}>, ids: string[]) => {
        setExpandedItems(ids);
    };

    const resetErrors = () => {
        setErrorHelperText('');
        setErrorInPermission(false);
    };

    return (
        <TableContainer>
            <Dialog
                open={modalIsOpen}
                onClose={() => {
                    handleCloseModal(false);
                }}
                disableBackdropClick
            >
                <DialogContainer>
                    <DialogTitle>New Resource</DialogTitle>
                    <DialogContent>
                        <InputRowContainer>
                            <InputLabel htmlFor="name">Resource Name:</InputLabel>
                            <PermissionStyledInput
                                id="name"
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                                    const val = e.target.value
                                        .replace(resourceForbiddenCharsRegex || DEFAULT_FORBIDDEN_CHARS_REGEX, '')
                                        .toLowerCase();
                                    if (permissionNameFirstFocus && !modalInEditMode && permissionEl.current) {
                                        permissionEl.current.value = val;
                                    }
                                }}
                                onBlur={() => {
                                    setPermissionNameFirstFocus(false);
                                }}
                                type="text"
                                inputRef={nameEl}
                                defaultValue={
                                    modalInEditMode
                                        ? (currentModalResourceRef as ResourcesItem['_resources']).name
                                        : undefined
                                }
                                autoFocus
                            />
                        </InputRowContainer>
                        <InputRowContainer>
                            <InputLabel htmlFor="permission">Permission name:</InputLabel>
                            <PermissionStyledInput
                                id="permission"
                                type="text"
                                inputRef={permissionEl}
                                InputProps={{
                                    startAdornment: modalInEditMode
                                        ? ''
                                        : currentModalResourceKey
                                        ? `${currentModalResourceKey}.`
                                        : '',
                                }}
                                inputProps={{
                                    readOnly: modalInEditMode,
                                }}
                                defaultValue={modalInEditMode ? currentModalResourceKey : ''}
                                disabled={modalInEditMode}
                                helperText={errorHelperText}
                                error={errorInPermission}
                            />
                        </InputRowContainer>
                    </DialogContent>
                    <DialogActions>
                        <Buttons.CloseButton
                            variant="outlined"
                            onClick={() => {
                                handleCloseModal(false);
                            }}
                        >
                            Close
                        </Buttons.CloseButton>
                        <Buttons.SaveButton variant="contained" color="primary" onClick={handleResource}>
                            Save
                        </Buttons.SaveButton>
                    </DialogActions>
                </DialogContainer>
            </Dialog>
            <Dialog open={modalDeleteIsOpen} onClose={() => handleCloseModal(true)} disableBackdropClick>
                <DialogContainer>
                    <DialogTitle>Delete Resources</DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex' }}>
                            <Typography>Are you sure you want to delete the following resources:</Typography>
                        </div>
                        <TreeView
                            defaultCollapseIcon={<Icons.TreeCollapseIcon />}
                            defaultExpandIcon={<Icons.TreeExpandIcon />}
                            defaultExpanded={expandedItems}
                            disableSelection
                        >
                            <TreeGenerator
                                resources={
                                    {
                                        [currentModalResourceKey]: currentModalResourceRef,
                                    } as ResourcesItem['_resources']
                                }
                                handleOpenModal={handleOpenModal}
                                icons={Icons}
                            />
                        </TreeView>
                    </DialogContent>
                    <DialogActions>
                        <Buttons.CloseButton variant="outlined" onClick={() => handleCloseModal(true)}>
                            Close
                        </Buttons.CloseButton>
                        <Buttons.DeleteButton variant="contained" color="secondary" onClick={handleDeleteResources}>
                            Delete
                        </Buttons.DeleteButton>
                    </DialogActions>
                </DialogContainer>
            </Dialog>
            <TreeHeaderContainer>
                <ResourceTitle>Resource</ResourceTitle>
                <PermissionTitle>Permission</PermissionTitle>
            </TreeHeaderContainer>
            <StyledTreeView
                defaultCollapseIcon={<Icons.TreeCollapseIcon />}
                defaultExpandIcon={<Icons.TreeExpandIcon />}
                expanded={expandedItems}
                disableSelection
                onNodeToggle={handleExpand}
            >
                <TreeGenerator resources={resources._resources} handleOpenModal={handleOpenModal} icons={Icons} />
            </StyledTreeView>
            <AddResourceBlock
                onClick={() => {
                    handleOpenModal(resources);
                }}
            >
                <Components.AddResource />
            </AddResourceBlock>
        </TableContainer>
    );
};

export default TreeBlock;

const TreeHeaderContainer = withTheme(styled.div`
    display: flex;
    font-size: 18px;
    height: 86px;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: ${({ theme }: ThemeType) => theme.palette.text.disabled};
    margin-left: 22px;

    div {
        padding-bottom: 5px;
        margin-top: auto;
    }
`);

const ResourceTitle = styled.div`
    width: 15%;
    min-width: 250px;
`;

const PermissionTitle = styled.div`
    flex-grow: 1;
    margin-left: -22px;
`;

const AddResourceBlock = styled.span`
    cursor: pointer;
`;

const StyledTreeView = styled(TreeView)`
    position: relative;
    *,
    *::before,
    *::after {
        transition: none !important;
        animation: none !important;
    }

    li > ul {
        display: none;
    }

    li.Mui-expanded > ul {
        display: block;
    }
`;

const DialogContainer = styled.div`
    padding: 15px;
    min-width: 450px;

    ${
        // @ts-ignore
        ItemResource
    } {
        position: initial;
        padding-left: 10px;
    }

    ${TreeItemContent}:hover ${ActionsContainer} {
        display: none;
    }
`;

const PermissionStyledInput = withTheme(styled(TextField)`
    flex-grow: 1;

    .MuiInputBase-root {
        color: ${({ theme }: ThemeType) => theme.palette.text.disabled};
    }

    & input {
        color: ${({ theme }: ThemeType) => theme.palette.text.primary};
        &.Mui-disabled {
            color: ${({ theme }: ThemeType) => theme.palette.text.disabled};
            cursor: not-allowed;
        }
    }
`);

const InputRowContainer = styled.div`
    display: flex;

    .MuiFormLabel-root {
        padding-top: 8px;
    }
`;
