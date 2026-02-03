import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../app/auth.service';
import { RegisterDto } from '../../application/dto/register.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { Role } from '../../domain/value-objects/roles.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('debería llamar a authService.register y retornar el resultado', async () => {
      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'pass',
        firstName: 'Test',
        lastName: 'User',
        cedula: '1231231231',
        phone: '0999999999',
        role: Role.CLIENT,
      };

      const expectedResult = { id: '1', ...registerDto, isActive: true };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('debería llamar a authService.login y retornar el token', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'pass',
      };

      const expectedResult = {
        access_token: 'token123',
        user: { email: 'test@test.com' },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });
});