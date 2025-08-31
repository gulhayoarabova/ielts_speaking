import { Controller, Get } from '@nestjs/common';

@Controller('questions-temp')
export class QuestionTempController {
  @Get()
  getQuestions() {
    return [
      {
        question: 'Describe a situation when you helped someone.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a book you recently read.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a place you would like to visit in the future.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a skill you want to learn.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a piece of technology you often use.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe an interesting conversation you had.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a teacher who influenced you.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a time when you were late.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a special meal you enjoyed.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
      {
        question: 'Describe a memorable holiday from your childhood.',
        image: 'https://img.freepik.com/free-photo/modern-office-space-interior_158595-5206.jpg?semt=ais_hybrid&w=740&q=80',
      },
    ];
  }
}
