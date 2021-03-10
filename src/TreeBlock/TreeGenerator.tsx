import React from 'react';
import styled from 'styled-components';
import TreeItem from '@material-ui/lab/TreeItem';
import { withTheme } from '@material-ui/core';
import { FnTreeBlockHandleOpenModal, IconsInterfaceInternal, ResourcesItem } from '../types';

interface TreeGeneratorProps {
    resources: ResourcesItem['_resources'];
    handleOpenModal: FnTreeBlockHandleOpenModal;
    icons: IconsInterfaceInternal;
}

const TreeGenerator = ({ resources, handleOpenModal, icons: Icons }: TreeGeneratorProps) => {
    const items = resources || {};

    const handleAdd = (e: React.MouseEvent, resource: string) => {
        e.stopPropagation();
        handleOpenModal(items[resource], resources, resource);
    };

    const handleEdit = (e: React.MouseEvent, resource: string) => {
        e.stopPropagation();
        handleOpenModal(items[resource], resources, resource, false, true);
    };

    const handleDelete = (e: React.MouseEvent, resource: string) => {
        e.stopPropagation();
        handleOpenModal(items[resource], resources, resource, true);
    };

    return (
        <TreeBlockContainer>
            {Object.keys(items).map((resource) => {
                const hasChildren = Object.keys(items[resource]._resources).length > 0;
                return (
                    <StyledTreeItem
                        key={resource}
                        nodeId={resource}
                        label={
                            <TreeItemContent $hasChildren={hasChildren}>
                                {hasChildren ? (
                                    <Icons.TreeParentIcon color="primary" />
                                ) : (
                                    <Icons.TreeNodeIcon color="primary" style={{ fontSize: '11px' }} />
                                )}
                                <ItemResourceName $hasChildren={hasChildren}>{items[resource].name}</ItemResourceName>
                                <ItemResource>{resource}</ItemResource>
                                <ActionsContainer>
                                    <Icons.TreeAddIcon
                                        style={{ fontSize: '16px' }}
                                        onClick={(e: React.MouseEvent) => {
                                            handleAdd(e, resource);
                                        }}
                                    />
                                    <Icons.TreeEditIcon
                                        style={{ fontSize: '16px' }}
                                        onClick={(e: React.MouseEvent) => {
                                            handleEdit(e, resource);
                                        }}
                                    />
                                    <Icons.TreeDeleteIcon
                                        style={{ fontSize: '16px' }}
                                        color="error"
                                        onClick={(e: React.MouseEvent) => {
                                            handleDelete(e, resource);
                                        }}
                                    />
                                </ActionsContainer>
                            </TreeItemContent>
                        }
                    >
                        {Object.keys(items[resource]._resources).length > 0 && (
                            <TreeGenerator
                                resources={items[resource]._resources}
                                handleOpenModal={handleOpenModal}
                                icons={Icons}
                            />
                        )}
                    </StyledTreeItem>
                );
            })}
        </TreeBlockContainer>
    );
};

export default TreeGenerator;

const StyledTreeItem = styled(TreeItem)``;

const TreeBlockContainer = styled.div`
    & .MuiTreeItem-content,
    & .MuiTreeItem-label {
        position: initial;
    }
`;

export const ActionsContainer = styled.span`
    display: none;
    margin-left: auto;
    z-index: 1;

    svg {
        vertical-align: middle;
    }
`;

const ItemResourceName = styled.span<{ $hasChildren: boolean }>`
    font-weight: ${({ $hasChildren }: any) => ($hasChildren ? 'bold' : 'normal')};
    font-size: ${({ $hasChildren }: any) => ($hasChildren ? '16px' : '14px')};
    padding-left: 5px;
`;

export const ItemResource = withTheme(styled.span`
    position: absolute;
    left: max(15%, 250px);
    color: ${(props: any) => props.theme.palette.text.disabled};
`);

export const TreeItemContent = withTheme(styled.div`
    display: flex;
    line-height: 31px;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: ${(props: any) => (props['$hasChildren'] ? props.theme.palette.text.disabled : 'transparent')};
    align-items: center;

    &:hover ${ActionsContainer} {
        display: block;
    }
`);
