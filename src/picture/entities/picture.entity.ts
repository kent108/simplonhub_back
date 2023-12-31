import { Store } from "src/store/entities/store.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity ( {name: 'picture'})
export class Picture { 
    @PrimaryGeneratedColumn()
    id: number;

    @Column( {type: 'varchar', length: 255})
    name: string;

    @Column({type: 'varchar', length: 10})
    type: string;

    @Column( {type: 'varchar', length: 255 })
    path: string;

    @OneToOne(() => Store, (store) => store.picture)
    stores: Store[];
}
