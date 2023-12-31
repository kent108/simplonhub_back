import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}
  async register(createAuthDto: CreateAuthDto) {
    const { name, firstname, pseudo, mail, phone, password } = createAuthDto;

    // hashage du mot de passe
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // création d'une entité user
    const user = this.userRepository.create({
      name,
      firstname,
      pseudo,
      mail,
      phone,
      password: hashedPassword,
    });
    const defaultRole = await this.roleRepository.findOneBy({ role: 'user' }); // SELECT * FROM role WHERE role = 'user'
    if (!defaultRole) {
      throw new NotFoundException('Default role not found');
    }
    user.date_in = new Date(); // set date_in
    user.role_id = defaultRole.id; // set default role

    try {
      // enregistrement de l'entité user
      const createdUser = await this.userRepository.save(user);
      delete createdUser.password;
      return createdUser;
    } catch (error) {
      // gestion des erreurs
      if (error.code === '23505') {
        throw new ConflictException('user already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async login(loginDto: LoginDto) {
    const { mail, password } = loginDto;

    // j'inclue le roleId dans le playload de mon token
    const user = await this.userRepository.findOne({
      where: { mail },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const userId = user.id;
    const roleId = user.role.id; // roleId depuis user entities
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { mail, userId, roleId }; // Ajoute le roleIddans le payload
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException(
        'Ces identifiants ne sont pas bons, désolé',
      );
    }
  }

  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; userId?: number }> {
    try {
      const payload = this.jwtService.verify(token); // Vérifie le token et obtient le payload
      console.log('payload : ', payload);
      const userId = payload.userId;
      console.log('je suis dans validateToken userId : ', userId);

      return { valid: true, userId };
    } catch (error) {
      return { valid: false };
    }
  }
}
