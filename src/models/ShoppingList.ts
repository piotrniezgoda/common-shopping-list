export interface ShoppingListItem {
    id: string;
    name: string;
    quantity: number;
    order: number;
    checked: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class ShoppingList {
    id: string;
    name: string;
    shareId: string;
    items: ShoppingListItem[]
    createdAt: Date;
    updatedAt: Date;

    constructor(data: {
        id: string,
        name: string,
        shareId: string,
        items: ShoppingListItem[],
        createdAt: Date,
        updatedAt: Date,
    }
    ) {
        this.id = data.id;
        this.name = data.name;
        this.shareId = data.shareId;
        this.items = data.items;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}