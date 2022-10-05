export class Node {
    id: number;
    projectId: string; //the project this node belongs to
    parentId: number = null; // id of the parent node if it has one
    type: string; //eg text, image, video etc
    value: string; //holds data of type
    childrenIds: number[] = [];
    imageurl : string;
    fileUrl : string;
    files : any[] = [];
}
