import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { NotFoundException } from '@nestjs/common';

export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async create(createStoreDto: CreateStoreDto) {
    const store = new Store();

    Object.assign(store, createStoreDto);

    return this.storeRepository.save(store);
  }

  async findAll() {
    return await this.storeRepository.find();
  }

  async findOne(id: number) {
    const found = await this.storeRepository.findOneBy({ id: id });
    if (!found) {
      throw new NotFoundException(`Etablissement #${id} non trouvé`);
    }
    if (!found.comments) {
      found.comments = [];
    }
    // console.log('je suis dans le store service et je log found : ', found);

    return found;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto) {
    console.log('Je suis dans le storeService et je Logg', updateStoreDto);
    const storeToUpdate = await this.findOne(id);
    Object.assign(storeToUpdate, updateStoreDto);
    return this.storeRepository.save(storeToUpdate);
  }

  async remove(id: number) {
    const storeToRemove = await this.findOne(id);
    if (!storeToRemove) {
      throw new NotFoundException(`Etablissement #${id} non trouvé`);
    }
    return this.storeRepository.remove(storeToRemove);
  }

  async getStoresByCategory(categoryId: string): Promise<Store[]> {
    console.log(
      'je suis dans le store service et je log categoryId : ',
      categoryId,
    );

    // Récupérez les magasins avec leurs catégories et commentaires associés
    const stores = await this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.categories', 'category')
      .where('category.id = :categoryId', { categoryId })
      .leftJoinAndSelect('store.comments', 'comment')
      .getMany();

    // console.log('je suis dans le store service et je log stores : ', stores);
    return stores;
  }
}
