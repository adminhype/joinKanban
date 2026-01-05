import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Subscription } from 'rxjs';
import { authState } from '@angular/fire/auth';
import { ContactInterface } from '../../interfaces/contact.interface';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);
  private userSubscription: Subscription | null = null;
  
  showOverlay = false;
  initials: string = '';

  ngOnInit() {
    this.userSubscription = authState(this.authService.firebaseAuth).subscribe(user => {
      if (user && user.email) {
        this.firebaseService.contactList$.subscribe((contacts) => {
          this.updateInitials(user.email!, contacts);
        });
      }else{
        this.initials = '';
      }
    });
  }

  updateInitials(email: string, contacts: ContactInterface[]) {
    const contact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());

    let displayName = email;
    if (contact && contact.name){
      displayName = contact.name;
    }
    this.initials = this.extractInitials(displayName);
  }

  private extractInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }

  toggleOverlay() {
    this.showOverlay = !this.showOverlay;
  }

  ngOnDestroy(){
    if(this.userSubscription){
      this.userSubscription.unsubscribe();
    }
  }
}