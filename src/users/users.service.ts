import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, user: IUser) {
    const checkEmail = await this.findOneByUsername(createUserDto.email);
    if (checkEmail) {
      throw new BadRequestException(
        `Email: ${createUserDto.email} đã tồn tại trên hệ thống, vui lòng sử dụng email khác`,
      );
    }
    const hashPassword = this.getHashPassword(createUserDto.password);
    const result = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: result._id,
      createAt: result.createdAt,
    };
  }
  async register(registerUserDto: RegisterUserDto) {
    const checkEmail = await this.findOneByUsername(registerUserDto.email);
    if (checkEmail) {
      throw new BadRequestException(
        `Email: ${registerUserDto.email} đã tồn tại trên hệ thống, vui lòng sử dụng email khác`,
      );
    }
    const userRole = await this.roleModel.findOne({
      name: USER_ROLE
    })
    const hashPassword = this.getHashPassword(registerUserDto.password);
    const user = await this.userModel.create({
      ...registerUserDto,
      password: hashPassword,
      role: userRole?._id,
    });
    return {
      _id: user?._id,
      createAt: user?.createdAt,
    };
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found usser';
    }
    const user = await this.userModel
      .findOne({
        _id: id,
      })
      .select('-password')
      .populate({path: 'role', select: {name: 1, _id: 1}})
    return {
      ...user.toJSON(),
    };
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username,
    }).populate({path: 'role', select: {name: 1}});
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user';
    }
    const foundUser = await this.userModel.findById(id);
    if(foundUser && foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("Không thể xóa tài khoản admin@gmail.com")
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.userModel.softDelete({
      _id: id,
    });
  }
  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };
  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({path: 'role', select: {name: 1}});
  };
}
