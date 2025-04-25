import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { SetsComponent } from './components/sets/sets.component';
import { CardListComponent } from './components/card-list/card-list.component';
import { CardDetailsComponent } from './components/card-details/card-details.component';
import { ForumsComponent } from './components/forums/forums.component';
import { ForumCreateComponent } from './components/forum-create/forum-create.component';
import { ForumUpdateComponent } from './components/forum-update/forum-update.component';
import { CollectionComponent } from './components/collection/collection.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

// Route Configuration
export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'home', component: HomeComponent },
    { path: 'sets', component: SetsComponent, canActivate: [AuthGuard] },
    { path: 'users', component: UserTableComponent, canActivate: [AdminGuard] },
    { path: 'collection', component: CollectionComponent, canActivate: [AuthGuard] },
    { path: 'sets/:id', component: CardListComponent, canActivate: [AuthGuard] },
    { path: 'cards/:id', component: CardDetailsComponent, canActivate: [AuthGuard] },
    { path: 'sets/:id/forums', component: ForumsComponent, canActivate: [AuthGuard] },
    { path: 'forums/:id/create', component: ForumCreateComponent, canActivate: [AuthGuard] },
    { path: 'forums/:id/edit', component: ForumUpdateComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/home'}
];
