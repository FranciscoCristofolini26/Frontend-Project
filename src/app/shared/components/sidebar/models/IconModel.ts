export interface IconModel{
    icon:string,
    label:string,
    active?:boolean,
    url:string,
    queryParams?: Record<string, string>
}
