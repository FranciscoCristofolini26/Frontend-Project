import { IconModel } from "./IconModel";

export interface NavigationSectionsModel{
    title: string, 
    items: IconModel[],
    active?: boolean;
}