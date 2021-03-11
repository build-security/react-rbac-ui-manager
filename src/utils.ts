import { PermissionsObject, ResourcesItem } from './types';

export const getAllResources = (data: PermissionsObject): string[] => {
    const recurse = (resource: PermissionsObject | ResourcesItem) => {
        let ret: string[] = [];

        if (!resource.hasOwnProperty('_resources')) {
            return ret;
        }
        Object.keys(resource._resources).forEach((item) => {
            ret.push(item);
            ret = [ ...ret, ...recurse(resource._resources[item]) ]
        });
        return ret;
    };

    return recurse(data);
};
