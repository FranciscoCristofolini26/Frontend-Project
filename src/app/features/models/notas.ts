export interface Nota {
    id: string;
    title: string;
    content: string;
    edited: Date;
    favourite: boolean;
    fixed: boolean;
    fixedAt: Date | null;
}
