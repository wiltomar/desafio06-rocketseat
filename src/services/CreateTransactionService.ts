import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepositoy = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('This operation is not possible, insufficient funds.');
    }

    let categoryFind = await categoryRepositoy.findOne({
      where: { title: category },
    });

    if (!categoryFind) {
      categoryFind = categoryRepositoy.create({ title: category });

      await categoryRepositoy.save(categoryFind);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryFind.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
