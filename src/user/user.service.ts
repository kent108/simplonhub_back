import { Injectable, NotFoundException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto); // new User()
    const defaultRole = await this.roleRepository.findOneBy({ role: 'user' }); // SELECT * FROM role WHERE role = 'user'
    if (!defaultRole) {
      throw new NotFoundException('Default role not found');
    }
    newUser.date_in = new Date(); // set date_in
    newUser.role_id = defaultRole.id; // set default role
    const user = await this.userRepository.save(newUser); // INSERT INTO user (username, password, role_id) VALUES ('', '', 1)
    return user;
  }

  async findAll() {
    const user = await this.userRepository.find({
      relations: ['role'],
    });
    return user;
  }

  async findOne(id: number) {
    const found = await this.userRepository.findOneBy({ id: id });
    if (!found) {
      throw new NotFoundException('User not found');
    }
    return found;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.findOne(id);
    Object.assign(userToUpdate, updateUserDto);
    return this.userRepository.save(userToUpdate);
  }

  async remove(id: number) {
    const userToRemove = await this.findOne(id);
    if (!userToRemove) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(userToRemove);
  }

  // async checkToken(token: string) {
  //   // Vérifie la validité du token
  //   console.log('je suis dans checkToken : ', token);

  //   return new Promise((resolve, reject) => {
  //     // Crée une promesse
  //     try {
  //       jwt.verify(token, process.env.PRIVATEKEY_TOKEN); // Vérifie le token
  //       console.log(
  //         'je suis dans le try du checkToken : et le token est valide',
  //       );
  //       resolve(true); // Le token est valide
  //     } catch (error) {
  //       if (error instanceof jwt.TokenExpiredError) {
  //         // Si le token a expiré
  //         reject('Token has expired'); // Le token a expiré
  //       } else {
  //         reject('Token is invalid'); // Le token est invalide pour une autre raison
  //       }
  //     }
  //   });
  // }

  async softDelete(userId: number): Promise<void> {
    const userSoftDelete = await this.findOne(userId);
    console.log('je suis dans userservice softdelete : ', userSoftDelete);

    userSoftDelete.date_out = new Date();
    await this.userRepository.save(userSoftDelete);
  }

  async checkToken(token: string) {
    console.log('je suis dans checkToken : ', token);

    return new Promise(async (resolve, reject) => {
      try {
        const decodedToken = jwt.verify(
          token,
          process.env.PRIVATEKEY_TOKEN,
        ) as any; // Vérifie le token et le décode

        // Assurez-vous que votre token contient une clé `id` ou similaire avec l'ID de l'utilisateur
        const userId = decodedToken.userId;

        if (!userId) {
          reject("Le token ne contient pas d'ID utilisateur");
          return;
        }

        const user = await this.findOne(userId);
        if (!user) {
          reject("Le compte n'existe pas");
          return;
        }
        if (user.date_out) {
          reject('Le compte a été supprimé');
          return;
        }
        resolve(true); // Le token est valide et l'utilisateur n'est pas supprimé
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          // Si le token a expiré
          reject('Token has expired');
        } else {
          reject('Token is invalid'); // Le token est invalide pour une autre raison
        }
      }
    });
  }
}
