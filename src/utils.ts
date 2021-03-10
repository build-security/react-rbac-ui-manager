import { PermissionsObject, ResourcesItem } from './types';

export const getAllResources = (data: PermissionsObject): string[] => {
    const f = (resource: PermissionsObject | ResourcesItem) => {
        let ret: string[] = [];
        if (!('_resources' in resource)) {
            return ret;
        }
        Object.keys(resource._resources).forEach((item) => {
            ret.push(item);
            ret = ret.concat(f(resource._resources[item]));
        });
        return ret;
    };

    return f(data);
};
